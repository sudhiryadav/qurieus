import type { CheckoutEventsData } from "@paddle/paddle-js";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** Google Ads tag ID (e.g. AW-123456789). Load via gtag config alongside GA4. */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";

/**
 * Optional Google Ads conversion "send_to" values from Ads → Goals → Conversions → Tag setup.
 * Format: AW-123456789/AbCdEfGhIjKlMnO_pQr
 */
const GADS_SENDTO = {
  sign_up: process.env.NEXT_PUBLIC_GADS_CONVERSION_SIGNUP ?? "",
  subscribe: process.env.NEXT_PUBLIC_GADS_CONVERSION_SUBSCRIBE ?? "",
  purchase: process.env.NEXT_PUBLIC_GADS_CONVERSION_PURCHASE ?? "",
  lead: process.env.NEXT_PUBLIC_GADS_CONVERSION_LEAD ?? "",
} as const;

export function isGaEnabled(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

export function isGoogleAdsEnabled(): boolean {
  return Boolean(GOOGLE_ADS_ID);
}

/** Load gtag snippet when either GA4 or Google Ads should run. */
export function isGtagSnippetEnabled(): boolean {
  return isGaEnabled() || isGoogleAdsEnabled();
}

function fireGoogleAdsConversion(
  sendTo: string,
  params?: { value?: number; currency?: string; transaction_id?: string }
): void {
  if (!sendTo || typeof window === "undefined" || !window.gtag) {
    return;
  }
  const payload: Record<string, unknown> = { send_to: sendTo };
  if (params?.value != null) payload.value = params.value;
  if (params?.currency) payload.currency = params.currency;
  if (params?.transaction_id) payload.transaction_id = params.transaction_id;
  window.gtag("event", "conversion", payload);
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

/** sign_up (GA4) + optional Google Ads conversion. */
export function trackMarketingSignUp(params: { method: string }): void {
  trackGaEvent("sign_up", params);
  if (GADS_SENDTO.sign_up) {
    fireGoogleAdsConversion(GADS_SENDTO.sign_up);
  }
}

/** subscribe (GA4) + optional Google Ads conversion — use for paid subscriptions, trials, upgrades. */
export function trackMarketingSubscribe(params: {
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: Record<string, unknown>[];
  plan_name?: string;
  flow?: string;
}): void {
  const { items, plan_name, flow, ...rest } = params;
  trackGaEvent("subscribe", {
    ...rest,
    items,
    plan_name,
    flow,
  });
  if (GADS_SENDTO.subscribe) {
    fireGoogleAdsConversion(GADS_SENDTO.subscribe, {
      value: rest.value,
      currency: rest.currency,
      transaction_id: rest.transaction_id,
    });
  }
}

/** purchase (GA4) + optional Google Ads conversion — e.g. one-time payments. */
export function trackMarketingPurchase(params: {
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: Record<string, unknown>[];
}): void {
  const { items, ...rest } = params;
  trackGaEvent("purchase", { ...rest, items });
  if (GADS_SENDTO.purchase) {
    fireGoogleAdsConversion(GADS_SENDTO.purchase, {
      value: rest.value,
      currency: rest.currency,
      transaction_id: rest.transaction_id,
    });
  }
}

/** generate_lead (GA4) + optional Google Ads conversion. */
export function trackMarketingLead(params?: { method?: string }): void {
  trackGaEvent("generate_lead", { method: params?.method ?? "contact_form" });
  if (GADS_SENDTO.lead) {
    fireGoogleAdsConversion(GADS_SENDTO.lead);
  }
}

/** Paddle checkout.completed: amounts are in minor units (cents). */
/** In-app subscription flows (trial, saved-card payment, etc.) using DB plan row. */
export function trackSubscribeFromAppPlan(
  plan: { id: string; name: string; price: number; currency: string },
  options: { flow: string; transaction_id?: string }
): void {
  trackMarketingSubscribe({
    value: plan.price,
    currency: plan.currency,
    transaction_id: options.transaction_id,
    plan_name: plan.name,
    flow: options.flow,
    items: [
      {
        item_id: plan.id,
        item_name: plan.name,
        item_category: "subscription",
        price: plan.price,
        quantity: 1,
      },
    ],
  });
}

export function trackSubscribeFromPaddleCheckout(
  data: CheckoutEventsData | undefined
): void {
  if (!data?.totals || !data.currency_code) {
    trackMarketingSubscribe({ flow: "paddle_checkout" });
    return;
  }
  const value = data.totals.total / 100;
  const currency = String(data.currency_code);
  const items = data.items?.map((item) => ({
    item_id: item.price_id,
    item_name: item.product?.name ?? item.price_name ?? "subscription",
    item_category: "subscription",
    price: item.totals?.total != null ? item.totals.total / 100 : undefined,
    quantity: item.quantity,
  }));
  trackMarketingSubscribe({
    value,
    currency,
    transaction_id: data.transaction_id,
    items,
    plan_name: data.items?.[0]?.product?.name,
    flow: "paddle_checkout",
  });
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

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
