"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import ToasterContext from "./api/contex/ToasetContex";
import { useEffect, useState } from "react";
import PreLoader from "@/components/Common/PreLoader";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);
  useEffect(() => {
    // Create and inject the QueriuzChatConfig script
    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.QueriuzChatConfig = {
        documentOwnerId: 'cmarrl8mj0000vjqyb9jmhcoa',
        theme: 'light',
        position: 'bottom-right'
      };
    `;
    document.head.appendChild(configScript);

    // Create and inject the embed.js script
    const embedScript = document.createElement('script');
    embedScript.src = 'http://localhost:3000/embed.js';
    embedScript.async = true;
    document.head.appendChild(embedScript);

    // Cleanup function to remove scripts when component unmounts
    return () => {
      document.head.removeChild(configScript);
      document.head.removeChild(embedScript);
    };
  }, []);

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body
        className={`${inter.className} bg-white dark:bg-dark-1 dark:text-white`}
      >
        {loading ? (
          <PreLoader />
        ) : (
          <SessionProvider
            refetchInterval={5 * 60} // Refresh session every 5 minutes
            refetchOnWindowFocus={true}
          >
            <ThemeProvider
              attribute="class"
              enableSystem={false}
              defaultTheme="light"
            >
              <ToasterContext />
              <Header />
              {children}
              <Footer />
              <ScrollToTop />
            </ThemeProvider>
          </SessionProvider>
        )}
      </body>
    </html>
  );
}
