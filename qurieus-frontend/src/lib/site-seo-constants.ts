/** Shared static SEO / schema values (safe to import from server or client layouts). */

export const siteUrl = "https://qurieus.com";
export const siteName = "Qurieus";
export const siteTitle =
  "Qurieus AI - AI Document Conversations | Chat with PDFs & Documents";
export const siteDescription =
  "Qurieus AI powers AI document conversations—chat with PDFs, ask questions about your documents, and embed an AI chatbot on your website. Agentic platform with human escalation. Upload documents, train the AI, get instant answers. Perfect for lawyers, HR, SaaS, and startups.";
export const imageUrl = `${siteUrl}/images/og-image.png`;
export const logoUrl = `${siteUrl}/images/logo/logo.png`;
export const siteKeywords =
  "Qurieus AI, Qurieus, AI document conversations, AI document Q&A, chat with PDF, AI document chatbot, PDF chatbot, document AI, agentic AI, human agent escalation, AI to human handoff, hybrid AI chat, AI plus human support, ask questions about documents, AI document reader, document conversation AI, knowledge base AI, document management AI, embed AI chat, website chatbot, Intercom alternative, AI document search, document summarization AI, legal document AI, HR document AI, SaaS document AI, startup document AI, RAG, retrieval augmented generation, document embeddings, AI document assistant, smart document search, conversational AI documents, escalated to agent, live agent support";

export function getStructuredDataJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Qurieus",
        alternateName: ["Qurieus AI", "Qurieus - AI Document Conversations"],
        url: siteUrl,
        logo: { "@type": "ImageObject", url: logoUrl },
        description:
          "Qurieus AI powers AI document conversations—chat with PDFs, documents, and embed AI chatbots on your website.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Qurieus AI - AI Document Conversations",
        description: siteDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage-home`,
        name: siteTitle,
        description: siteDescription,
        url: siteUrl,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: {
          "@type": "SoftwareApplication",
          name: "Qurieus",
          alternateName: "Qurieus AI",
          applicationCategory: "BusinessApplication",
          description:
            "AI document conversations platform—chat with PDFs, escalate to human agents when needed",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Qurieus",
        alternateName: ["Qurieus AI", "Qurieus AI Document Q&A"],
        description: siteDescription,
        url: siteUrl,
        logo: logoUrl,
        image: imageUrl,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "AI Document Assistant",
        operatingSystem: "Web",
        featureList: [
          "AI document conversations",
          "AI document Q&A",
          "Chat with PDF",
          "Document chatbot",
          "Knowledge base AI",
          "Website embed",
          "Document search",
          "AI summarization",
          "Agentic AI",
          "Human agent escalation",
          "AI to human handoff",
          "Hybrid AI and human support",
        ],
        keywords:
          "Qurieus AI, AI document conversations, AI document Q&A, chat with PDF, document AI, PDF chatbot, knowledge base AI, agentic AI, human agent escalation, AI to human handoff",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        author: { "@id": `${siteUrl}/#organization` },
        publisher: {
          "@type": "Organization",
          name: "Qurieus",
          logo: { "@type": "ImageObject", url: logoUrl },
        },
      },
    ],
  });
}
