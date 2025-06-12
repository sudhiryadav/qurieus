"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import { useEffect, useState } from "react";
import PreLoader from "@/components/Common/PreLoader";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import SessionRedirector from "@/components/SessionRedirector";
import ToasterContext from "@/components/contex/ToasetContex";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const showSidebar = pathname.startsWith("/user") || pathname.startsWith("/admin");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head>
        <link rel="icon" href="/images/logo/logo.svg" sizes="any" />
      </head>

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
              <ToasterContext />
              <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <div className="flex">
                {showSidebar && (
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                )}
                <main className="flex-1 pt-16">
                  {children}
                </main>
              </div>
              <Footer />
              <ScrollToTop />
            </ThemeProvider>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
