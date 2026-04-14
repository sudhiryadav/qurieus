import type { CheckoutEventsData } from "@paddle/paddle-js";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function isGaEnabled(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

/** GA4 recommended / custom events (no-op when GA is disabled or gtag not loaded). */
export function trackGaEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) {
    return;
  }
  window.gtag("event", eventName, params ?? {});
}

/** Mark as a key event (conversion) in GA4: Admin → Events → ai_conversation */
export const GA_EVENT_AI_CONVERSATION = "ai_conversation";

export function trackGaAiConversation(
  params: Record<string, string | undefined>
): void {
  trackGaEvent(GA_EVENT_AI_CONVERSATION, params);
}

export const GA_OAUTH_PENDING_KEY = "ga_oauth_pending";

export type GaOauthPending = {
  intent: "login" | "sign_up";
  provider: string;
};

/**
 * Google tag (gtag.js) — Google Ads conversion event for purchase.
 * Fires alongside GA4 when the Google tag is installed (same `gtag` queue).
 * @see https://support.google.com/google-ads/answer/13258081
 */
export const GA_EVENT_PURCHASE_CONVERSION = "conversion_event_purchase";

export type PurchaseConversionType =
  | "free_trial"
  | "free_tier"
  | "paddle_checkout"
  | "direct_payment"
  | "subscription_upgrade";

/** GA4-style line items (also useful for Ads reporting when linked). */
export type PurchaseConversionItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

export type PurchaseConversionParams = {
  currency: string;
  /** Transaction amount in major currency units (e.g. USD dollars). */
  value: number;
  transaction_id: string;
  plan_name: string;
  purchase_type: PurchaseConversionType;
  plan_id?: string;
  price_id?: string;
  items?: PurchaseConversionItem[];
};

export function trackPurchaseConversion(
  params: PurchaseConversionParams
): void {
  trackGaEvent(GA_EVENT_PURCHASE_CONVERSION, {
    currency: params.currency,
    value: params.value,
    transaction_id: params.transaction_id,
    plan_name: params.plan_name,
    purchase_type: params.purchase_type,
    ...(params.plan_id ? { plan_id: params.plan_id } : {}),
    ...(params.price_id ? { price_id: params.price_id } : {}),
    ...(params.items?.length ? { items: params.items } : {}),
  });
}

/** Paddle checkout `totals` are in the smallest currency unit (e.g. cents). */
export function paddleMinorUnitsToMajor(totalMinor: number): number {
  return Math.round((totalMinor / 100) * 1e6) / 1e6;
}

export function buildPurchaseTransactionId(
  prefix: string,
  userId: string | undefined
): string {
  const safeUser = userId ? userId.slice(0, 12) : "anon";
  return `${prefix}_${safeUser}_${Date.now()}`;
}

type PlanLike = {
  id: string;
  name: string;
  price: number;
  currency: string;
  paddleConfig?: { priceId: string } | null;
};

/** Free tier or free trial (value may be 0). */
export function trackPurchaseConversionFromPlan(
  plan: PlanLike,
  purchaseType: "free_trial" | "free_tier",
  userId: string | undefined
): void {
  trackPurchaseConversion({
    currency: plan.currency,
    value: plan.price <= 0 ? 0 : plan.price,
    transaction_id: buildPurchaseTransactionId(purchaseType, userId),
    plan_id: plan.id,
    plan_name: plan.name,
    purchase_type: purchaseType,
    ...(plan.paddleConfig?.priceId
      ? { price_id: plan.paddleConfig.priceId }
      : {}),
  });
}

export function trackPurchaseConversionFromDirectPayment(
  plan: PlanLike,
  userId: string | undefined
): void {
  trackPurchaseConversion({
    currency: plan.currency,
    value: plan.price,
    transaction_id: buildPurchaseTransactionId("direct_payment", userId),
    plan_id: plan.id,
    plan_name: plan.name,
    purchase_type: "direct_payment",
    ...(plan.paddleConfig?.priceId
      ? { price_id: plan.paddleConfig.priceId }
      : {}),
  });
}

export function trackPurchaseConversionFromPaddleCheckout(
  checkout: CheckoutEventsData,
  plan: PlanLike | null
): void {
  const transactionId = checkout.transaction_id || checkout.id;
  const firstItem = checkout.items[0];
  const items: PurchaseConversionItem[] = checkout.items.map((item) => ({
    item_id: item.price_id,
    item_name: item.product.name,
    price: paddleMinorUnitsToMajor(item.totals.total),
    quantity: item.quantity,
  }));
  trackPurchaseConversion({
    currency: checkout.currency_code,
    value: paddleMinorUnitsToMajor(checkout.totals.total),
    transaction_id: transactionId,
    plan_id: plan?.id,
    plan_name: plan?.name ?? firstItem?.product.name ?? "Subscription",
    purchase_type: "paddle_checkout",
    price_id: plan?.paddleConfig?.priceId ?? firstItem?.price_id,
    items,
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
