"use client";

import {
  GA_MEASUREMENT_ID,
  GA_OAUTH_PENDING_KEY,
  GOOGLE_ADS_ID,
  isGaEnabled,
  isGtagSnippetEnabled,
  trackGaEvent,
  trackMarketingSignUp,
  type GaOauthPending,
} from "@/lib/gtag";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

const sendUserEmail =
  process.env.NEXT_PUBLIC_GA_SEND_USER_EMAIL === "true";

function flushPendingOAuthEvent() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const raw = sessionStorage.getItem(GA_OAUTH_PENDING_KEY);
    if (!raw) {
      return;
    }
    sessionStorage.removeItem(GA_OAUTH_PENDING_KEY);
    const { intent, provider } = JSON.parse(raw) as GaOauthPending;
    if (intent === "sign_up") {
      trackMarketingSignUp({ method: provider });
    } else {
      trackGaEvent("login", { method: provider });
    }
  } catch {
    sessionStorage.removeItem(GA_OAUTH_PENDING_KEY);
  }
}

/**
 * Loads GA4 and ties hits to the signed-in user.
 * - page_view: path, full URL, title (SPA navigations).
 * - user_id: internal DB id (recommended by Google; not PII).
 * - login / sign_up: credentials + Google OAuth (recommended events); optional Google Ads conversions via env.
 * - ai_conversation: fire from agent console / embed (mark as key event in GA4).
 * - Optional user_email user property when NEXT_PUBLIC_GA_SEND_USER_EMAIL=true.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const lastPath = useRef<string | null>(null);
  const queryString = searchParams.toString();
  const path = `${pathname}${queryString ? `?${queryString}` : ""}`;

  useEffect(() => {
    if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) {
      return;
    }

    if (lastPath.current === path) {
      return;
    }
    lastPath.current = path;

    const tid = window.setTimeout(() => {
      if (lastPath.current !== path || !window.gtag) {
        return;
      }
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title || path,
      });
    }, 0);
    return () => clearTimeout(tid);
  }, [path]);

  useEffect(() => {
    if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) {
      return;
    }

    if (status === "loading") {
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      window.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: false,
        user_id: session.user.id,
      });

      flushPendingOAuthEvent();

      if (sendUserEmail && session.user.email) {
        window.gtag("set", "user_properties", {
          user_email: session.user.email,
        });
      }
      return;
    }

    window.gtag("set", { user_id: null });
    if (sendUserEmail) {
      window.gtag("set", "user_properties", {
        user_email: null,
      });
    }
  }, [status, session?.user?.id, session?.user?.email]);

  if (!isGtagSnippetEnabled()) {
    return null;
  }

  const gtagLoaderId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${
            GA_MEASUREMENT_ID
              ? `gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`
              : ""
          }
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagLoaderId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
