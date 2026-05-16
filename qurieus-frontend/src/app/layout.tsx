import RootLayoutClient from "@/components/RootLayoutClient";
import {
  StructuredDataScript,
  ThemeBootstrapScript,
} from "@/components/head/HeadScripts";
import {
  getStructuredDataJsonLd,
  imageUrl,
  logoUrl,
  siteDescription,
  siteKeywords,
  siteName,
  siteTitle,
  siteUrl,
} from "@/lib/site-seo-constants";
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredDataJsonLd = getStructuredDataJsonLd();

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Qurieus" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href={siteUrl} />
        <link rel="icon" href="/images/logo/favicon.svg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/logo/logo.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/logo/logo.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/logo/logo.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Qurieus AI - AI Document Conversations, Chat with PDFs and Your Documents"
        />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:image:alt"
          content="Qurieus AI - AI Document Conversations, Chat with PDFs and Your Documents"
        />
        <meta property="linkedin:owner" content="qurieus" />
        <meta property="linkedin:page_id" content="qurieus" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:secure_url" content={imageUrl} />
        <meta name="instagram:card" content="summary_large_image" />
        <meta name="instagram:title" content={siteTitle} />
        <meta name="instagram:description" content={siteDescription} />
        <meta name="instagram:image" content={imageUrl} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="subject" content="AI Document Q&A and Chat with PDF Platform" />
        <meta name="copyright" content="Qurieus" />
        <meta
          name="classification"
          content="Business, AI, Document Management, SaaS"
        />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="target" content="all" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="!scroll-smooth">
        {/* Blocking scripts: SSR-only (see HeadScripts) — avoids React 19 client script warnings */}
        <ThemeBootstrapScript />
        <StructuredDataScript jsonLd={structuredDataJsonLd} />
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
