import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

/**
 * PaddleCheckout - Reusable Paddle checkout component (Overlay or Inline)
 * @param productId Paddle Product ID (optional)
 * @param priceId Paddle Price ID (optional)
 * @param mode 'overlay' | 'inline' (default: 'overlay')
 * @param email User email (optional)
 * @param passthrough Any passthrough data (optional)
 * @param onComplete Callback after successful checkout (optional)
 * Usage:
 *   <PaddleCheckout ref={ref} productId="..." mode="overlay" onComplete={fn} />
 *   ref.current?.openCheckout();
 */
export type PaddleCheckoutProps = {
  productId?: string;
  priceId?: string;
  mode?: "overlay" | "inline";
  email?: string;
  passthrough?: string;
  onComplete?: (data: any) => void;
  className?: string;
};

export type PaddleCheckoutRef = {
  openCheckout: () => void;
};

const PADDLE_VENDOR_ID = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;

export const PaddleCheckout = forwardRef<PaddleCheckoutRef, PaddleCheckoutProps>(
  (
    {
      productId,
      priceId,
      mode = "overlay",
      email,
      passthrough,
      onComplete,
      className = "",
    },
    ref
  ) => {
    const inlineContainerRef = useRef<HTMLDivElement>(null);
    const checkoutRef = useRef<any>(null);

    // Load Paddle.js script
    useEffect(() => {
      if (typeof window === "undefined") return;
      if ((window as any).Paddle) return;
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/paddle.js";
      script.async = true;
      script.onload = () => {
        (window as any).Paddle.Setup({ vendor: Number(PADDLE_VENDOR_ID) });
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    // Setup Paddle when script is loaded
    useEffect(() => {
      if (typeof window === "undefined" || !(window as any).Paddle) return;
      (window as any).Paddle.Setup({ vendor: Number(PADDLE_VENDOR_ID) });
    }, []);

    // Expose openCheckout to parent via ref
    useImperativeHandle(ref, () => ({
      openCheckout,
    }));

    function openCheckout() {
      if (typeof window === "undefined" || !(window as any).Paddle) return;
      const Paddle = (window as any).Paddle;
      if (mode === "inline" && inlineContainerRef.current) {
        Paddle.Checkout.open({
          product: productId,
          price: priceId,
          email,
          passthrough,
          frameTarget: inlineContainerRef.current,
          frameInitialHeight: 416,
          frameStyle: "width:100%; min-width:312px; background:transparent; border:none;",
          successCallback: onComplete,
        });
      } else {
        Paddle.Checkout.open({
          product: productId,
          price: priceId,
          email,
          passthrough,
          successCallback: onComplete,
        });
      }
    }

    // For inline mode, render the container div
    return mode === "inline" ? (
      <div ref={inlineContainerRef} className={className} />
    ) : null;
  }
);

PaddleCheckout.displayName = "PaddleCheckout"; 