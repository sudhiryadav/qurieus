import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <section className="pb-8 pt-20 dark:bg-dark lg:pb-[70px] lg:pt-[120px]">
      <div className="container">
        <SectionTitle
          subtitle="Features"
          title="What Makes Qurieus Powerful"
          paragraph="Qurieus helps you chat with your documents, search and summarize knowledge, and embed AI-powered Q&A on your site. Upload files, ask questions, and get instant, context-aware answers."
        />

        <div className="-mx-4 mt-12 flex flex-wrap lg:mt-20">
          {featuresData.map((feature, i) => (
            <SingleFeature key={i} feature={feature} />
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-dark-3 dark:bg-dark-2 lg:mt-16">
          <p className="mb-3 text-sm font-semibold text-body-color dark:text-gray-4">
            Solutions for your use case:
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/live-chat-for-website" className="text-primary hover:underline">
              Live Chat for Website
            </Link>
            <Link href="/intercom-alternative" className="text-primary hover:underline">
              Intercom Alternative
            </Link>
            <Link href="/chat-widget-for-wordpress" className="text-primary hover:underline">
              Chat Widget for WordPress
            </Link>
            <Link href="/zendesk-alternative" className="text-primary hover:underline">
              Zendesk Alternative
            </Link>
            <Link href="/ai-chatbot-for-website" className="text-primary hover:underline">
              AI Chatbot for Website
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
