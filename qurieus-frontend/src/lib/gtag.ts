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

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
