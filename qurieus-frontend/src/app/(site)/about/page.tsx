import About from "@/components/About";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Team from "@/components/Team";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Qurieus - AI Document Q&A & Chat with PDF Platform",
  description: "Learn about Qurieus - the AI document platform that lets you chat with PDFs and ask questions about your documents. Our mission is to make document knowledge accessible through AI-powered conversations.",
  keywords: "Qurieus about, AI document platform, document Q&A, chat with PDF",
};

const AboutPage = () => {
  return (
    <main>
      <Breadcrumb pageName="About Us Page" />
      <About />
      {/* <Team /> */}
    </main>
  );
};

export default AboutPage;
