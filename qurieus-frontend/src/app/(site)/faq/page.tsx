import Faq from "@/components/Faq";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Qurieus - AI-Powered Document Conversations",
  description:
    "Find answers to common questions about Qurieus, your AI-powered knowledge base and chat platform.",
};

const FaqPage = () => {
  return (
    <main>
      <Breadcrumb pageName="FAQ" />
      <Faq />
    </main>
  );
};

export default FaqPage;
