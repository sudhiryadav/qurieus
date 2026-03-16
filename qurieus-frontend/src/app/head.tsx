export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qurieus.com';
  const siteName = 'Qurieus';
  const title = 'Qurieus AI - AI Document Conversations';
  const description = 'Qurieus AI powers AI document conversations—chat with PDFs, ask questions about your documents, and embed an AI chatbot on your website. Agentic platform with human escalation.';
  const imageUrl = `${siteUrl}/images/og-image.png`;
  const logoUrl = `${siteUrl}/images/logo/logo.png`;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Qurieus" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />
      
      {/* Favicon and App Icons */}
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
      <meta property="og:image:alt" content="Qurieus AI - AI Document Conversations" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content="Qurieus AI - AI Document Conversations" />
      
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
      <meta name="keywords" content="Qurieus AI, AI document conversations, AI document Q&A, chat with PDF, document AI, PDF chatbot, agentic AI, human agent escalation" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </>
  );
}
