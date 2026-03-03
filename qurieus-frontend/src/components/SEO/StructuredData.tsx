import Head from 'next/head';

interface StructuredDataProps {
  type: 'organization' | 'software' | 'website' | 'breadcrumb' | 'faq' | 'article';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'software' ? 'SoftwareApplication' : 
               type === 'organization' ? 'Organization' :
               type === 'website' ? 'WebSite' :
               type === 'breadcrumb' ? 'BreadcrumbList' :
               type === 'faq' ? 'FAQPage' :
               type === 'article' ? 'Article' : 'WebPage'
    };

    return { ...baseData, ...data };
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData())
        }}
      />
    </Head>
  );
}

// Predefined structured data for common use cases
export const OrganizationData = {
  name: "Qurieus",
  url: "https://qurieus.com",
  logo: "https://qurieus.com/images/logo/logo.png",
  description: "AI-powered platform for document conversations",
  address: {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressLocality": "New Delhi",
    "addressRegion": "Delhi"
  },
  contactPoint: {
    "@type": "ContactPoint",
    "telephone": process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+919953633888",
    "contactType": "customer service",
    "email": process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@qurieus.com"
  },
  sameAs: [
    "https://twitter.com/qurieus",
    "https://linkedin.com/company/qurieus",
    "https://facebook.com/qurieus"
  ]
};

export const SoftwareApplicationData = {
  name: "Qurieus",
  description: "Transform your documents into interactive conversations with AI",
  url: "https://qurieus.com",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  author: {
    "@type": "Organization",
    "name": "Qurieus"
  }
};

export const WebsiteData = {
  name: "Qurieus",
  url: "https://qurieus.com",
  description: "AI-powered document conversation platform",
  potentialAction: {
    "@type": "SearchAction",
    "target": "https://qurieus.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}; 