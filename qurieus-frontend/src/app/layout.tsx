"use client";

import PreLoader from "@/components/Common/PreLoader";
import { Toast } from "@/components/Common/Toast";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import SessionRedirector from "@/components/SessionRedirector";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Head from "./head";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <Head />
      <body>
        <SessionProvider>
          <SessionRedirector />
          {loading ? (
            <PreLoader />
          ) : (
            <ThemeProvider
              attribute="class"
              enableSystem={false}
              defaultTheme="light"
            >
              <Toast />
              <SidebarProvider>
                <Header />
                <main className="flex-1 pt-16">{children}</main>
              </SidebarProvider>
              <Footer />
              <ScrollToTop />
            </ThemeProvider>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
