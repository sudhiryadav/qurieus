import { notFound } from "next/navigation";
import { Metadata } from "next";
import SeoLandingPage from "@/components/SeoLandingPage";
import { SEO_PAGES } from "@/lib/seoPages";

const SEO_SLUGS = new Set(SEO_PAGES.map((p) => p.slug));

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SEO_PAGES.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = SEO_PAGES.find((p) => p.slug === slug);
  if (!config) return { title: "Qurieus" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qurieus.com";
  const url = `${baseUrl}/${slug}`;

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: config.keywords.join(", "),
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url,
      siteName: "Qurieus",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.metaTitle,
      description: config.metaDescription,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SeoPage({ params }: PageProps) {
  const { slug } = await params;

  if (!SEO_SLUGS.has(slug)) {
    notFound();
  }

  const config = SEO_PAGES.find((p) => p.slug === slug)!;
  return <SeoLandingPage config={config} />;
}
