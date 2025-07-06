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
    const inlineContainerRef = useRef<HTMLDivElement>(null);
    const [paddle, setPaddle] = useState<Paddle | null>(null);

    const { data: session } = useSession();
    const { email, id: applicationCustomerId, name } = session?.user || {}; // Use 'id' as applicationCustomerId

    useEffect(() => {
      initializePaddle({
        environment:
          process.env.NODE_ENV === "production" ? "production" : "sandbox",
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
        eventCallback: (event: PaddleEventData) => {
          if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
            onComplete?.(event.data);
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
            onClose?.(event.data);
            // Don't call close again here, it's already closed.
            // paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_ERROR) {
            onError?.(event.error);
            paddle?.Checkout.close();
          }
          if (event.name === CheckoutEventNames.CHECKOUT_FAILED) {
            onFailed?.(event.data);
            paddle?.Checkout.close();
          }
        },
      }).then((paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      });
    }, []);

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
      const settings: CheckoutSettings = {
        theme: theme === "dark" ? "dark" : "light",
        displayMode: mode,
      };
      paddle.Checkout.open({
        settings,
        items: [{ priceId }],
        customer: email ? { email } : undefined, // Ensure email is valid
        customData: {
          application_customer_id: applicationCustomerId,
          application_customer_email: email,
          application_customer_name: name,
          application_plan_id: planId,
        },
      });
    }

    async function updatePlan(subscriptionId: string, priceId: string) {
      if (!subscriptionId || !priceId)  return;

      try {
        const response = await axios.post('/api/paddle/update-plan', {
          subscriptionId,
          priceId,
        });
        if (response.data.success) {
          toast.success("Plan updated successfully. Please wait for the subscription to be updated in the customer portal.");
          onUpdatePlan?.(subscriptionId, priceId);
        } else {
          toast.error(response.data.error);
        }
      } catch (error) {
        console.error("Error updating plan:", error);
        toast.error("Error updating plan");
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

    return mode === "inline" ? (
      <div ref={inlineContainerRef} className={className} id="paddle-inline-checkout" />
    ) : null;
  },
);

PaddleCheckout.displayName = "PaddleCheckout";