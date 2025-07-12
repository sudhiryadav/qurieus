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
import { Providers } from "@/lib/providers";
import { usePathname } from "next/navigation";
import { IdentityProvider } from "@/components/IdentityProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Don't show footer on user layout pages
  const shouldShowFooter = !pathname?.startsWith('/user') && !pathname?.startsWith('/admin');

  // Static values for meta tags
  const siteUrl = 'https://qurieus.com';
  const siteName = 'Qurieus';
  const title = 'Qurieus - AI-Powered Document Conversations';
  const description = 'Transform your documents into interactive conversations with Qurieus. Our AI-powered platform allows you to upload PDFs, train the AI, and let your users engage with your content through natural conversations.';
  const imageUrl = `${siteUrl}/images/og-image.png`;
  const logoUrl = `${siteUrl}/images/logo/logo.png`;

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Qurieus" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href={siteUrl} />
        <link rel="icon" href="/images/logo/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Qurieus - AI-Powered Document Conversations" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content="Qurieus - AI-Powered Document Conversations" />
        {/* LinkedIn */}
        <meta property="linkedin:owner" content="qurieus" />
        <meta property="linkedin:page_id" content="qurieus" />
        {/* WhatsApp */}
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:secure_url" content={imageUrl} />
        {/* Additional Social Media */}
        <meta name="instagram:card" content="summary_large_image" />
        <meta name="instagram:title" content={title} />
        <meta name="instagram:description" content={description} />
        <meta name="instagram:image" content={imageUrl} />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Qurieus",
              "description": description,
              "url": siteUrl,
              "logo": logoUrl,
              "image": imageUrl,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Qurieus",
                "url": siteUrl
              },
              "publisher": {
                "@type": "Organization",
                "name": "Qurieus",
                "logo": {
                  "@type": "ImageObject",
                  "url": logoUrl
                }
              }
            })
          }}
        />
        {/* Additional SEO Meta Tags */}
        <meta name="keywords" content="AI, artificial intelligence, document processing, PDF, chatbot, conversation, SaaS, document management, natural language processing, machine learning" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Security Headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <script 
  src="http://localhost:8000/embed.js"
  data-api-key="cmd051tkd0000vjjumkfflmv2"
  data-initial-message="Hello! How can I help you today?"
  data-position="bottom-right"
  data-theme="light"
  data-show-sources="false"
  data-inline="false"
  async
></script>
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
              <Toast />
              <Providers>
                <IdentityProvider>
                  <Header />
                  <main className="flex-1 pt-16">{children}</main>
                </IdentityProvider>
              </Providers>
              {shouldShowFooter && <Footer />}
              <ScrollToTop />
            </ThemeProvider>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
