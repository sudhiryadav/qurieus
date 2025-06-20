import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Qurieus - AI-Powered Document Conversations",
  description:
    "Choose the perfect Qurieus plan for your organization's document conversation needs.",
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
