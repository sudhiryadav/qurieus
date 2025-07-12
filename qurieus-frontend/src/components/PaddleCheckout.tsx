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

export type PaddleCheckoutProps = {
  mode?: "overlay" | "inline";
  onComplete?: (data: CheckoutEventsData | undefined) => void;
  className?: string;
  onClose?: (data: CheckoutEventsData | undefined) => void;
  onError?: (data: CheckoutEventError | undefined) => void;
  onFailed?: (data: CheckoutEventsData | undefined) => void;
  onUpdatePlan?: (subscriptionId: string, priceId: string) => void;
};

export type PaddleCheckoutRef = {
  openCheckout: (priceId: string, planId: string) => void;
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
            logger.info("PaddleCheckout: Checkout completed, closing immediately");
            onComplete?.(event.data);
            // Close checkout immediately when payment is completed
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
            logger.info("PaddleCheckout: Checkout closed");
            onClose?.(event.data);
          }
          if (event.name === CheckoutEventNames.CHECKOUT_ERROR) {
            logger.error("PaddleCheckout: Checkout error", { error: event.error });
            onError?.(event.error);
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_FAILED) {
            logger.error("PaddleCheckout: Checkout failed", { eventData: event.data });
            onFailed?.(event.data);
            paddle?.Checkout.close();
          }
        },
      }).then((paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          logger.info("PaddleCheckout: Paddle initialized successfully");
          setPaddle(paddleInstance);
        } else {
          logger.error("PaddleCheckout: Failed to initialize Paddle");
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

    function openCheckout(priceId: string, planId: string) {
      if (!paddle) {
        logger.warn("PaddleCheckout: Attempted to open checkout without Paddle instance");
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
      
      logger.info("PaddleCheckout: Opening checkout", {
        userId: applicationCustomerId,
        email: email,
        name: name,
        priceId: priceId,
        planId: planId
      });
      
      const settings: CheckoutSettings = {
        theme: theme === "dark" ? "dark" : "light",
        displayMode: mode,
      };
      
      paddle.Checkout.open({
        settings,
        items: [{ priceId }],
        customer: { 
          email: email,
        },
        customData: {
          application_customer_id: applicationCustomerId,
          application_customer_email: email,
          application_customer_name: name,
          application_plan_id: planId,
          session_id: session?.user?.id,
          timestamp: Date.now().toString(),
        },
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
        console.error("Error updating plan:", error);
        toast.error("Error updating plan. Please try again.");
      } finally {
        setIsUpdatingPlan(false);
      }
    }

    // New function to redirect to Paddle Customer Portal
    async function redirectToCustomerPortal(paddleCustomerId: string) {
      if (!paddleCustomerId) {
        logger.error("PaddleCheckout: Paddle Customer ID is required to redirect to portal");
        return;
      }

      logger.info("PaddleCheckout: Redirecting to customer portal", { paddleCustomerId });

      try {
        // Call your backend API to get the Customer Portal URL
        const response = await axios.post('/api/paddle/get-customer-portal-link', {
          paddleCustomerId,
        });
        const { portalUrl } = response.data;

        if (portalUrl) {
          logger.info("PaddleCheckout: Customer portal URL received", { paddleCustomerId });
          window.location.href = portalUrl; // Redirect the user
        } else {
          logger.error("PaddleCheckout: No portal URL received from backend", { paddleCustomerId });
        }
      } catch (error: any) {
        logger.error("PaddleCheckout: Error redirecting to customer portal", { 
          paddleCustomerId, 
          error: error.message 
        });
        console.error("Error redirecting to customer portal:", error);
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