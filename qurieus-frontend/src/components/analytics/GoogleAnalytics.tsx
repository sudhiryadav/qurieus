"use client";

import {
  GA_MEASUREMENT_ID,
  GA_OAUTH_PENDING_KEY,
  isGaEnabled,
  trackGaEvent,
  type GaOauthPending,
} from "@/lib/gtag";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
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
      trackGaEvent("sign_up", { method: provider });
    } else {
      trackGaEvent("login", { method: provider });
    }
  } catch {
    sessionStorage.removeItem(GA_OAUTH_PENDING_KEY);
  }
}

/**
 * Loads GA4 without `<Script>` components so React 19 client trees do not warn
 * ("Encountered a script tag while rendering...").
 */
function useGaLoader() {
  useEffect(() => {
    if (!isGaEnabled() || typeof window === "undefined") {
      return;
    }

    const initId = "ga4-inline-init";
    if (!document.getElementById(initId)) {
      const inline = document.createElement("script");
      inline.id = initId;
      inline.textContent = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
`;
      document.head.appendChild(inline);

      const ext = document.createElement("script");
      ext.async = true;
      ext.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(ext);
    }
  }, []);
}

/**
 * Loads GA4 and ties hits to the signed-in user.
 */
export function GoogleAnalytics() {
  useGaLoader();

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

  if (!isGaEnabled()) {
    return null;
  }

  return null;
}
