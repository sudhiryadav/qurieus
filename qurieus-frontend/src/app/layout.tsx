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
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [embedUserId, setEmbedUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Fetch default embed user id from DB (set by super admin) so widget works for dev and prod
  useEffect(() => {
    fetch("/api/site-config/embed")
      .then((res) => res.json())
      .then((data) => data.embedUserId && setEmbedUserId(data.embedUserId))
      .catch(() => {});
  }, []);

  // Show footer on all pages including admin and user dashboard
  const shouldShowFooter = true;

  // Don't show header on agent pages
  const shouldShowHeader = !pathname?.startsWith('/agent');

  // Don't add padding-top on agent pages
  const shouldAddPadding = !pathname?.startsWith('/agent');

  // Static values for meta tags - "Qurieus AI" and "AI document conversations" help differentiate from "Qurious" in search
  const siteUrl = 'https://qurieus.com';
  const siteName = 'Qurieus';
  const title = 'Qurieus AI - AI Document Conversations | Chat with PDFs & Documents';
  const description = 'Qurieus AI powers AI document conversations—chat with PDFs, ask questions about your documents, and embed an AI chatbot on your website. Agentic platform with human escalation. Upload documents, train the AI, get instant answers. Perfect for lawyers, HR, SaaS, and startups.';
  const imageUrl = `${siteUrl}/images/og-image.png`;
  const logoUrl = `${siteUrl}/images/logo/logo.png`;
  const keywords = 'Qurieus AI, Qurieus, AI document conversations, AI document Q&A, chat with PDF, AI document chatbot, PDF chatbot, document AI, agentic AI, human agent escalation, AI to human handoff, hybrid AI chat, AI plus human support, ask questions about documents, AI document reader, document conversation AI, knowledge base AI, document management AI, embed AI chat, website chatbot, Intercom alternative, AI document search, document summarization AI, legal document AI, HR document AI, SaaS document AI, startup document AI, RAG, retrieval augmented generation, document embeddings, AI document assistant, smart document search, conversational AI documents, escalated to agent, live agent support';

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
        <meta property="og:image:alt" content="Qurieus AI - AI Document Conversations, Chat with PDFs and Your Documents" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content="Qurieus AI - AI Document Conversations, Chat with PDFs and Your Documents" />
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
        {/* Schema.org structured data - Organization + WebSite help Google understand brand and differentiate from similar names */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  "name": "Qurieus",
                  "alternateName": ["Qurieus AI", "Qurieus - AI Document Conversations"],
                  "url": siteUrl,
                  "logo": { "@type": "ImageObject", "url": logoUrl },
                  "description": "Qurieus AI powers AI document conversations—chat with PDFs, documents, and embed AI chatbots on your website."
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  "url": siteUrl,
                  "name": "Qurieus AI - AI Document Conversations",
                  "description": description,
                  "publisher": { "@id": `${siteUrl}/#organization` }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "Qurieus",
                  "alternateName": ["Qurieus AI", "Qurieus AI Document Q&A"],
                  "description": description,
                  "url": siteUrl,
                  "logo": logoUrl,
                  "image": imageUrl,
                  "applicationCategory": "BusinessApplication",
                  "applicationSubCategory": "AI Document Assistant",
                  "operatingSystem": "Web",
                  "featureList": ["AI document conversations", "AI document Q&A", "Chat with PDF", "Document chatbot", "Knowledge base AI", "Website embed", "Document search", "AI summarization", "Agentic AI", "Human agent escalation", "AI to human handoff", "Hybrid AI and human support"],
                  "keywords": "Qurieus AI, AI document conversations, AI document Q&A, chat with PDF, document AI, PDF chatbot, knowledge base AI, agentic AI, human agent escalation, AI to human handoff",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  },
                  "author": { "@id": `${siteUrl}/#organization` },
                  "publisher": {
                    "@type": "Organization",
                    "name": "Qurieus",
                    "logo": { "@type": "ImageObject", "url": logoUrl }
                  }
                }
              ]
            })
          }}
        />
        {/* Additional SEO Meta Tags */}
        <meta name="keywords" content={keywords} />
        <meta name="subject" content="AI Document Q&A and Chat with PDF Platform" />
        <meta name="copyright" content="Qurieus" />
        <meta name="classification" content="Business, AI, Document Management, SaaS" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="target" content="all" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Security Headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
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
                  {shouldShowHeader && <Header />}
                  <main className={`flex-1 ${shouldAddPadding ? 'pt-16' : ''}`}>{children}</main>
                </IdentityProvider>
              </Providers>
              {shouldShowFooter && <Footer />}
              <ScrollToTop />
            </ThemeProvider>
          )}
        </SessionProvider>
        {shouldShowFooter && embedUserId && (
          <Script
            src={`${process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")}/embed.js`}
            data-api-key={embedUserId}
            data-initial-message="Hello! How can I help you today?"
            data-position="bottom-right"
            data-theme="light"
            async
          />
        )}
      </body>
    </html>
  );
}