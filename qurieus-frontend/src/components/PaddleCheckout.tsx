import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { initializePaddle, getPaddleInstance, Paddle } from "@paddle/paddle-js";

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
  email?: string;
  passthrough?: string;
  onComplete?: (data: any) => void;
  className?: string;
};

export type PaddleCheckoutRef = {
  openCheckout: (priceId: string) => void;
};

export const PaddleCheckout = forwardRef<
  PaddleCheckoutRef,
  PaddleCheckoutProps
>(
  (
    { mode = "overlay", email, passthrough, onComplete, className = "" },
    ref,
  ) => {
    const inlineContainerRef = useRef<HTMLDivElement>(null);
    const paddleInstanceRef = useRef<any>(null);
    const [paddle, setPaddle] = useState<Paddle | null>(null);

    // Download and initialize Paddle instance from CDN
    useEffect(() => {
      initializePaddle({
        environment:
          process.env.NODE_ENV === "production" ? "production" : "sandbox",
        token: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || "",
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
        // passthrough: passthrough || undefined,
        // onComplete,
      });
    }

    return mode === "inline" ? (
      <div ref={inlineContainerRef} className={className} />
    ) : null;
  },
);

PaddleCheckout.displayName = "PaddleCheckout";
