import About from "@/components/About";
import CallToAction from "@/components/CallToAction";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import { Metadata } from "next";

const siteUrl = "https://qurieus.com";

export const metadata: Metadata = {
  title: "Qurieus AI - AI Document Conversations | Chat with PDFs & Documents",
  description: "Qurieus AI powers AI document conversations—chat with PDFs, ask questions about your documents, and embed an AI chatbot on your website. Agentic platform with human escalation. Upload documents, train the AI, get instant answers. Perfect for lawyers, HR, SaaS, and startups.",
  keywords: "Qurieus AI, Qurieus, AI document conversations, AI document Q&A, chat with PDF, AI document chatbot, PDF chatbot, document AI, agentic AI, human agent escalation, AI to human handoff, hybrid AI chat, AI plus human support, ask questions about documents, AI document reader, document conversation AI, knowledge base AI, document management AI, embed AI chat, website chatbot, Intercom alternative, AI document search, document summarization AI, legal document AI, HR document AI, SaaS document AI, startup document AI, RAG, document embeddings, AI document assistant, smart document search, conversational AI documents, escalated to agent, live agent support",
  openGraph: {
    title: "Qurieus AI - AI Document Conversations | Chat with PDFs & Embed AI Chat",
    description: "Qurieus AI powers AI document conversations—chat with PDFs and documents using AI. Agentic platform with human escalation. Upload, train, get instant answers. Embed on your website. Free trial.",
    url: siteUrl,
    siteName: "Qurieus",
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Qurieus AI - AI Document Conversations, Chat with PDFs and Your Documents",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qurieus AI - AI Document Conversations | Chat with PDFs & Embed AI Chat",
    description: "Qurieus AI powers AI document conversations—chat with PDFs using AI. Agentic platform with human escalation. Upload, train, get instant answers. Embed AI chatbot on your website.",
    images: [`${siteUrl}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Qurieus AI - AI Document Conversations | Chat with PDFs & Documents",
    "description": "Qurieus AI powers AI document conversations—chat with PDFs, ask questions about your documents, and embed an AI chatbot. Agentic platform with human escalation.",
    "url": siteUrl,
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Qurieus",
      "alternateName": "Qurieus AI",
      "applicationCategory": "BusinessApplication",
      "description": "AI document conversations platform—chat with PDFs, escalate to human agents when needed"
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <ScrollUp />
      <Hero />
      <Features />
      <About />
      <CallToAction />
      <Pricing />
      <Testimonials />
      <Faq />
      {/* <Team /> */}
      <Contact />
    </main>
  );
}
