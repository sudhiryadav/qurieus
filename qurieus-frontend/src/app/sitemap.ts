import { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seoPages";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://qurieus.com";

const staticPages: { url: string; changefreq: "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/pricing", changefreq: "monthly", priority: 0.9 },
  { url: "/contact", changefreq: "monthly", priority: 0.7 },
  { url: "/how-it-works", changefreq: "monthly", priority: 0.8 },
  { url: "/faq", changefreq: "monthly", priority: 0.8 },
  { url: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { url: "/terms-of-service", changefreq: "yearly", priority: 0.3 },
  { url: "/refund-policy", changefreq: "yearly", priority: 0.3 },
  { url: "/legal-notice", changefreq: "yearly", priority: 0.3 },
  { url: "/signin", changefreq: "monthly", priority: 0.6 },
  { url: "/signup", changefreq: "monthly", priority: 0.6 },
  { url: "/for-you/startups", changefreq: "monthly", priority: 0.7 },
  { url: "/for-you/saas", changefreq: "monthly", priority: 0.7 },
  { url: "/for-you/lawyers", changefreq: "monthly", priority: 0.7 },
  { url: "/for-you/hr", changefreq: "monthly", priority: 0.7 },
  { url: "/features/chat-with-your-documents", changefreq: "monthly", priority: 0.7 },
  { url: "/features/ai-powered-qa", changefreq: "monthly", priority: 0.7 },
  { url: "/features/easy-website-embedding", changefreq: "monthly", priority: 0.7 },
  { url: "/features/knowledge-search-summarization", changefreq: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: today,
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));

  const seoEntries: MetadataRoute.Sitemap = SEO_PAGES.map((page) => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...seoEntries];
}
