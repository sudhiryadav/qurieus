"use client";

import React from "react";
import Link from "next/link";
import Script from "next/script";
import Breadcrumb from "@/components/Common/Breadcrumb";
import TryForFreeButton from "@/components/Common/TryForFreeButton";
import type { SeoPageConfig } from "@/lib/seoPages";

interface SeoLandingPageProps {
  config: SeoPageConfig;
}

export default function SeoLandingPage({ config }: SeoLandingPageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qurieus.com";
  const pageUrl = `${baseUrl}/${config.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: config.metaTitle,
    description: config.metaDescription,
    url: pageUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: config.title, item: pageUrl },
      ],
    },
  };

  const faqStructuredData =
    config.faqs && config.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: config.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <main>
      <Script
        id={`structured-data-${config.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {faqStructuredData && (
        <Script
          id={`faq-structured-data-${config.slug}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}
      <Breadcrumb
        pageName={config.title}
        pageDescription={config.heroDescription.slice(0, 80) + "..."}
      />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-6 text-center text-dark dark:text-white">
          {config.h1}
        </h1>
        <p className="text-xl text-body-color dark:text-gray-4 mb-12 text-center max-w-2xl mx-auto">
          {config.heroDescription}
        </p>

        {config.sections.map((section, idx) => (
          <section key={idx} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white">
              {section.heading}
            </h2>
            <p className="text-lg text-body-color dark:text-gray-4 mb-4">
              {section.content}
            </p>
            {section.bullets && (
              <ul className="list-disc ml-6 text-lg text-body-color dark:text-gray-4 space-y-2">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {config.faqs && config.faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {config.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 dark:border-dark-3 p-4"
                >
                  <h3 className="font-semibold text-dark dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-body-color dark:text-gray-4">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="text-center pt-8 border-t border-gray-200 dark:border-dark-3">
          <p className="text-lg mb-6 text-body-color dark:text-gray-4">
            Ready to improve your customer support with AI? Start free today.
          </p>
          <TryForFreeButton />
          <p className="mt-6 text-sm text-gray-500 dark:text-dark-6">
            No credit card required.{" "}
            <Link href="/pricing" className="text-primary hover:underline">
              View pricing
            </Link>
          </p>
        </section>

        <section className="mt-16 pt-8 border-t border-gray-200 dark:border-dark-3">
          <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
            Related Solutions
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/intercom-alternative"
              className="text-primary hover:underline text-sm"
            >
              Intercom Alternative
            </Link>
            <Link
              href="/live-chat-for-website"
              className="text-primary hover:underline text-sm"
            >
              Live Chat for Website
            </Link>
            <Link
              href="/chat-widget-for-wordpress"
              className="text-primary hover:underline text-sm"
            >
              Chat Widget for WordPress
            </Link>
            <Link
              href="/customer-support-chat"
              className="text-primary hover:underline text-sm"
            >
              Customer Support Chat
            </Link>
            <Link
              href="/zendesk-alternative"
              className="text-primary hover:underline text-sm"
            >
              Zendesk Alternative
            </Link>
            <Link
              href="/ai-chatbot-for-website"
              className="text-primary hover:underline text-sm"
            >
              AI Chatbot for Website
            </Link>
            <Link
              href="/tawk-alternative"
              className="text-primary hover:underline text-sm"
            >
              Tawk Alternative
            </Link>
            <Link
              href="/drift-alternative"
              className="text-primary hover:underline text-sm"
            >
              Drift Alternative
            </Link>
            <Link
              href="/freshdesk-alternative"
              className="text-primary hover:underline text-sm"
            >
              Freshdesk Alternative
            </Link>
            <Link
              href="/live-chat-software"
              className="text-primary hover:underline text-sm"
            >
              Live Chat Software
            </Link>
            <Link
              href="/chat-support-software"
              className="text-primary hover:underline text-sm"
            >
              Chat Support Software
            </Link>
            <Link
              href="/how-it-works"
              className="text-primary hover:underline text-sm"
            >
              How It Works
            </Link>
            <Link href="/pricing" className="text-primary hover:underline text-sm">
              Pricing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
