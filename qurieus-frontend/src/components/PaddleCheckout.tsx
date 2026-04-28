import {
  CheckoutEventError,
  CheckoutEventNames,
  CheckoutEventsData,
  CheckoutSettings,
  initializePaddle,
  Paddle,
  PaddleEventData,
} from "@paddle/paddle-js";
import axios from "axios"; // Import axios for backend calls
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { logger } from "@/lib/logger";
import { buildPaddleCustomData } from "@/lib/paddleProduct";

export type PaddleCheckoutProps = {
  mode?: "overlay" | "inline";
  onComplete?: (data: CheckoutEventsData | undefined) => void;
  className?: string;
  onClose?: (data: CheckoutEventsData | undefined) => void;
  onError?: (data: CheckoutEventError | undefined) => void;
  onFailed?: (data: CheckoutEventsData | undefined) => void;
  onUpdatePlan?: (subscriptionId: string, priceId: string) => void;
};

function getCheckoutErrorDetails(event: PaddleEventData): { message: string; raw: any } {
  const eventAny = event as any;
  const rawError =
    eventAny?.error ||
    eventAny?.data?.error ||
    eventAny?.data?.errors?.[0] ||
    eventAny?.data ||
    null;

  const message =
    rawError?.message ||
    rawError?.detail ||
    rawError?.title ||
    "Checkout could not be completed.";

  return { message, raw: rawError };
}

export type PaddleCheckoutRef = {
  openCheckout: (priceId: string, planId: string, checkoutAttemptId?: string) => void;
  redirectToCustomerPortal: (customerId: string) => void;
  closeCheckout: () => void;
  updatePlan: (subscriptionId: string, priceId: string) => void;
};

export const PaddleCheckout = forwardRef<
  PaddleCheckoutRef,
  PaddleCheckoutProps
>(
  (
    {
      mode = "overlay",
      onComplete,
      onClose,
      onError,
      onFailed,
      className = "",
      onUpdatePlan,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const router = useRouter();
    const inlineContainerRef = useRef<HTMLDivElement>(null);
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

    const { data: session } = useSession();
    const { email, id: applicationCustomerId, name } = session?.user || {}; // Use 'id' as applicationCustomerId

    useEffect(() => {
      logger.info("PaddleCheckout: Initializing Paddle", { 
        environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
        hasToken: !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN 
      });
      
      initializePaddle({
        environment:
          process.env.NODE_ENV === "production" ? "production" : "sandbox",
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
        eventCallback: (event: PaddleEventData) => {
          logger.info("PaddleCheckout: Paddle event received", { 
            eventName: event.name, 
            eventData: event.data 
          });
          
          if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
            onComplete?.(event.data);
            // Close checkout immediately when payment is completed
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
            onClose?.(event.data);
          }
          if (event.name === CheckoutEventNames.CHECKOUT_ERROR) {
            const details = getCheckoutErrorDetails(event);
            logger.error("PaddleCheckout: Checkout error", {
              error: details.raw,
              message: details.message,
              eventData: event.data,
            });
            onError?.((details.raw || { message: details.message }) as CheckoutEventError);
          }
          if (event.name === CheckoutEventNames.CHECKOUT_FAILED) {
            onFailed?.(event.data);
          }
        },
      }).then((paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
        } else {
        }
      });
    }, [onComplete, onClose, onError, onFailed, paddle]);

    useImperativeHandle(ref, () => ({
      openCheckout,
      redirectToCustomerPortal,
      closeCheckout: () => {
        if (!paddle) return;
        paddle.Checkout.close();
      },
      updatePlan,
    }));  

    function openCheckout(priceId: string, planId: string, checkoutAttemptId?: string) {
      if (!paddle) {
        return;
      }
      
      // Security validation
      if (!applicationCustomerId || !email) {
        logger.error("PaddleCheckout: Missing required user data for checkout", { 
          hasApplicationCustomerId: !!applicationCustomerId, 
          hasEmail: !!email 
        });
        toast.error("Authentication error. Please log in again.");
        return;
      }
      
      const settings: CheckoutSettings = {
        theme: theme === "dark" ? "dark" : "light",
        displayMode: mode,
      };

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "";
      const successUrl = `${origin}/user/subscription?checkout=success`;
      const cancelUrl = `${origin}/pricing?checkout=cancelled`;

      logger.info("PaddleCheckout: Opening checkout", {
        checkoutAttemptId: checkoutAttemptId || null,
        userId: applicationCustomerId,
        email: email,
        name: name,
        priceId: priceId,
        planId: planId,
        mode,
        theme: settings.theme,
        displayMode: settings.displayMode,
        successUrl,
        cancelUrl,
        hasClientToken: !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        clientTokenPrefix: (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "").slice(0, 8),
        locationOrigin: typeof window !== "undefined" ? window.location.origin : null,
      });
      
      const customData = buildPaddleCustomData({
        application_customer_id: applicationCustomerId,
        application_customer_email: email,
        application_customer_name: name,
        application_plan_id: planId,
        session_id: session?.user?.id,
        timestamp: Date.now().toString(),
        tenantId: applicationCustomerId,
        practiceId: applicationCustomerId,
        orderId: `checkout_${applicationCustomerId}_${Date.now()}`,
        plan: planId,
        checkoutAttemptId: checkoutAttemptId || null,
      });

      logger.info("PaddleCheckout: Final checkout payload", {
        checkoutAttemptId: checkoutAttemptId || null,
        priceId,
        planId,
        customData,
      });

      paddle.Checkout.open({
        settings: {
          ...settings,
          successUrl,
        } as CheckoutSettings,
        items: [{ priceId }],
        customer: { 
          email: email,
        },
        customData,
      });
    }

    async function updatePlan(subscriptionId: string, priceId: string) {
      if (!subscriptionId || !priceId) {
        logger.warn("PaddleCheckout: Missing required data for plan update", { 
          hasSubscriptionId: !!subscriptionId, 
          hasPriceId: !!priceId 
        });
        return;
      }

      logger.info("PaddleCheckout: Starting plan update", { 
        subscriptionId, 
        priceId 
      });

      setIsUpdatingPlan(true);
      try {
        const response = await axios.post('/api/paddle/update-plan', {
          subscriptionId,
          priceId,
        });
        if (response.data.success) {
          logger.info("PaddleCheckout: Plan updated successfully", { 
            subscriptionId, 
            priceId 
          });
          toast.success("Plan upgraded successfully! Redirecting to subscription page...");
          onUpdatePlan?.(subscriptionId, priceId);
          // Redirect to subscription page after successful upgrade
          setTimeout(() => {
            router.push('/user/subscription');
          }, 1500);
        } else {
          logger.error("PaddleCheckout: Plan update failed", { 
            subscriptionId, 
            priceId, 
            error: response.data.error 
          });
          toast.error(response.data.error || "Failed to upgrade plan");
        }
      } catch (error: any) {
        logger.error("PaddleCheckout: Error updating plan", { 
          subscriptionId, 
          priceId, 
          error: error.message 
        });
        toast.error("Error updating plan. Please try again.");
      } finally {
        setIsUpdatingPlan(false);
      }
    }

    // New function to redirect to Paddle Customer Portal
    async function redirectToCustomerPortal(paddleCustomerId: string) {
      if (!paddleCustomerId) {
        return;
      }


      try {
        // Call your backend API to get the Customer Portal URL
        const response = await axios.post('/api/paddle/get-customer-portal-link', {
          paddleCustomerId,
        });
        const { portalUrl } = response.data;

        if (portalUrl) {
          window.location.href = portalUrl; // Redirect the user
        } else {
        }
      } catch (error: any) {
        logger.error("PaddleCheckout: Error redirecting to customer portal", { 
          paddleCustomerId, 
          error: error.message 
        });
        // Handle error, e.g., show a toast message
      }
    }

    return (
      <>
        <LoadingOverlay 
          loading={isUpdatingPlan} 
          htmlText="Upgrading your plan..." 
        />
        {mode === "inline" ? (
      <div ref={inlineContainerRef} className={className} id="paddle-inline-checkout" />
        ) : null}
      </>
    );
  },
);

PaddleCheckout.displayName = "PaddleCheckout";