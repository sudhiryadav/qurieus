"use client";

import PreLoader from "@/components/Common/PreLoader";
import { Toast } from "@/components/Common/Toast";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import SessionRedirector from "@/components/SessionRedirector";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/app-theme";
import { Suspense, useEffect, useState } from "react";
import { Providers } from "@/lib/providers";
import { usePathname } from "next/navigation";
import { IdentityProvider } from "@/components/IdentityProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [embedUserId, setEmbedUserId] = useState<string | null>(null);
  const pathname = usePathname();

  const shouldShowFooter = true;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    fetch("/api/site-config/embed")
      .then((res) => res.json())
      .then((data) => data.embedUserId && setEmbedUserId(data.embedUserId))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!shouldShowFooter || !embedUserId || typeof window === "undefined") {
      return;
    }
    const scriptId = `qurieus-embed-${embedUserId}`;
    if (document.getElementById(scriptId)) {
      return;
    }
    const base =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const s = document.createElement("script");
    s.id = scriptId;
    s.async = true;
    s.src = `${base}/embed.js`;
    s.dataset.apiKey = embedUserId;
    s.dataset.gaMeasurementId =
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
    s.dataset.initialMessage = "Hello! How can I help you today?";
    s.dataset.position = "bottom-right";
    s.dataset.theme = "light";
    document.body.appendChild(s);
  }, [embedUserId, shouldShowFooter]);

  const shouldShowHeader = !pathname?.startsWith("/agent");
  const shouldAddPadding = !pathname?.startsWith("/agent");

  return (
    <>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <SessionRedirector />
          {loading ? <PreLoader /> : null}
          <Toast />
          <Providers>
            <IdentityProvider>
              {shouldShowHeader && <Header />}
              <main className={`flex-1 bg-white dark:bg-dark ${shouldAddPadding ? "pt-16" : ""}`}>
                {children}
              </main>
            </IdentityProvider>
          </Providers>
          {shouldShowFooter && <Footer />}
          <ScrollToTop />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
