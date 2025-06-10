import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { initializePaddle, getPaddleInstance, Paddle, PaddleEventData, CheckoutEventNames, CheckoutEventsData, CheckoutEventError } from "@paddle/paddle-js";
import { useSession } from "next-auth/react";

/**
 * PaddleCheckout - Reusable Paddle checkout component (Overlay or Inline)
 * @param priceId Paddle Price ID (optional)
 * @param mode 'overlay' | 'inline' (default: 'overlay')
 * @param email User email (optional)
 * @param passthrough Any passthrough data (optional)
 * @param onComplete Callback after successful checkout (optional)
 * Usage:
 *   <PaddleCheckout ref={ref} priceId="..." mode="overlay" onComplete={fn} />
 *   ref.current?.openCheckout();
 */
export type PaddleCheckoutProps = {
  // priceId?: string;
  mode?: "overlay" | "inline";
  onComplete?: (data: CheckoutEventsData | undefined) => void;
  className?: string;
  onClose?: (data: CheckoutEventsData | undefined) => void;
  onError?: (data: CheckoutEventError | undefined) => void;
  onFailed?: (data: CheckoutEventsData | undefined) => void;
};

export type PaddleCheckoutRef = {
  openCheckout: (priceId: string) => void;
};

export const PaddleCheckout = forwardRef<
  PaddleCheckoutRef,
  PaddleCheckoutProps
>(({ mode = "overlay", onComplete, onClose, onError, onFailed, className = "" }, ref) => {
  const inlineContainerRef = useRef<HTMLDivElement>(null);
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  // get the user email from the session
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    initializePaddle({
      environment:
        process.env.NODE_ENV === "production" ? "production" : "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || "",
      eventCallback: (event: PaddleEventData) => {
        console.log("xxx Paddle event", event);
        if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
          onComplete?.(event.data);
          paddle?.Checkout.close();
        }
        if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
          onClose?.(event.data);
          paddle?.Checkout.close();
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
  }));

  function openCheckout(priceId: string) {
    if (!paddle) return;
    const settings: any = {
      theme: "light",
      displayMode: mode,
    };
    if (mode === "inline" && inlineContainerRef.current) {
      settings.frameTarget = inlineContainerRef.current;
      settings.frameInitialHeight = 416;
      settings.frameStyle =
        "width:100%; min-width:312px; background:transparent; border:none;";
    }
    paddle.Checkout.open({
      settings,
      items: [{ priceId }],
      customer: email ? { email } : undefined,
    });
  }

  return mode === "inline" ? (
    <div ref={inlineContainerRef} className={className} />
  ) : null;
});

PaddleCheckout.displayName = "PaddleCheckout";
