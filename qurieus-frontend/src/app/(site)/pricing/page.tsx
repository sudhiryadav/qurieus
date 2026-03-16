import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Qurieus - AI Document Q&A Plans & Pricing",
  description: "Choose the perfect Qurieus plan for your AI document Q&A needs. Chat with PDFs, embed AI chatbot on your website. Free trial available for individuals, teams, and enterprises.",
  keywords: "Qurieus pricing, AI document Q&A pricing, PDF chatbot plans, document AI subscription",
};

export default async function PricingPage() {
  return (
    <>
      <Breadcrumb pageName="Pricing" />
      <Pricing />
      <Faq />
    </>
  );
}
