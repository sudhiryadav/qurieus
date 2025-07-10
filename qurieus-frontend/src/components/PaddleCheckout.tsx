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
      initializePaddle({
        environment:
          process.env.NODE_ENV === "production" ? "production" : "sandbox",
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
        eventCallback: (event: PaddleEventData) => {
          console.log("Paddle event received:", event.name, event.data);
          
          if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
            console.log("Checkout completed, closing immediately");
            onComplete?.(event.data);
            // Close checkout immediately when payment is completed
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
            console.log("Checkout closed");
            onClose?.(event.data);
          }
          if (event.name === CheckoutEventNames.CHECKOUT_ERROR) {
            console.log("Checkout error:", event.error);
            onError?.(event.error);
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_FAILED) {
            console.log("Checkout failed");
            onFailed?.(event.data);
            paddle?.Checkout.close();
          }
        },
      }).then((paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
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
      if (!paddle) return;
      
      // Security validation
      if (!applicationCustomerId || !email) {
        console.error("Missing required user data for checkout");
        toast.error("Authentication error. Please log in again.");
        return;
      }
      
      console.log("Opening checkout for user:", {
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
      if (!subscriptionId || !priceId) return;

      setIsUpdatingPlan(true);
      try {
        const response = await axios.post('/api/paddle/update-plan', {
          subscriptionId,
          priceId,
        });
        if (response.data.success) {
          toast.success("Plan upgraded successfully! Redirecting to subscription page...");
          onUpdatePlan?.(subscriptionId, priceId);
          // Redirect to subscription page after successful upgrade
          setTimeout(() => {
            router.push('/user/subscription');
          }, 1500);
        } else {
          toast.error(response.data.error || "Failed to upgrade plan");
        }
      } catch (error) {
        console.error("Error updating plan:", error);
        toast.error("Error updating plan. Please try again.");
      } finally {
        setIsUpdatingPlan(false);
      }
    }

    // New function to redirect to Paddle Customer Portal
    async function redirectToCustomerPortal(paddleCustomerId: string) {
      if (!paddleCustomerId) {
        console.error("Paddle Customer ID is required to redirect to portal.");
        // You might want to show a user-friendly error here
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
          console.error("No portal URL received from backend.");
        }
      } catch (error) {
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