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

export const metadata: Metadata = {
  title: "Qurieus - AI-Powered Document Conversations",
  description: "Transform your documents into interactive conversations with Qurieus. Our AI-powered platform allows you to upload PDFs, train the AI, and let your users engage with your content through natural conversations.",
  keywords: "AI, artificial intelligence, document processing, PDF, chatbot, conversation, SaaS, document management, natural language processing, machine learning, document AI, PDF chatbot, AI document reader",
  openGraph: {
    title: "Qurieus - AI-Powered Document Conversations",
    description: "Transform your documents into interactive conversations with Qurieus. Our AI-powered platform allows you to upload PDFs, train the AI, and let your users engage with your content through natural conversations.",
    url: "https://qurieus.com",
    siteName: "Qurieus",
    images: [
      {
        url: "https://qurieus.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Qurieus - AI-Powered Document Conversations",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qurieus - AI-Powered Document Conversations",
    description: "Transform your documents into interactive conversations with Qurieus. Our AI-powered platform allows you to upload PDFs, train the AI, and let your users engage with your content through natural conversations.",
    images: ["https://qurieus.com/images/og-image.png"],
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function Home() {
  return (
    <main>
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
