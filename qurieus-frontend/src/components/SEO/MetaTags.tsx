import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function MetaTags({
  title = 'Qurieus - AI-Powered Document Conversations',
  description = 'Transform your documents into interactive conversations with Qurieus. Our AI-powered platform allows you to upload PDFs, train the AI, and let your users engage with your content through natural conversations.',
  keywords = 'AI, artificial intelligence, document processing, PDF, chatbot, conversation, SaaS, document management, natural language processing, machine learning',
  image = '/images/og-image.svg',
  url,
  type = 'website',
  author = 'Qurieus',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: MetaTagsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qurieus.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Qurieus" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.length > 0 && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* WhatsApp specific */}
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="qurieus" />
      <meta property="linkedin:page_id" content="qurieus" />
      
      {/* Additional Social Media */}
      <meta name="instagram:card" content="summary_large_image" />
      <meta name="instagram:title" content={title} />
      <meta name="instagram:description" content={description} />
      <meta name="instagram:image" content={fullImageUrl} />
    </Head>
  );
} 