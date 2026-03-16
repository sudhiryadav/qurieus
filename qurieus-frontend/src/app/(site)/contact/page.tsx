import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Qurieus - AI Document Q&A & Chat with PDF Platform",
  description: "Contact Qurieus to learn more about our AI document Q&A platform. Chat with PDFs, embed AI chatbot on your website. Get a demo or start your free trial.",
  keywords: "contact Qurieus, AI document Q&A demo, PDF chatbot support",
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb pageName="Contact Page" />

      <Contact />
    </>
  );
};

export default ContactPage;
