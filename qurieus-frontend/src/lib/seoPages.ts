/**
 * SEO landing page configurations for high-intent search terms.
 * Each page targets specific keywords to improve Google indexing.
 */
export interface SeoPageConfig {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroDescription: string;
  heroImage?: { src: string; alt: string };
  sections: {
    heading: string;
    content: string;
    bullets?: string[];
    image?: { src: string; alt: string };
  }[];
  keywords: string[];
  faqs?: { question: string; answer: string }[];
}

const UNSPLASH = (id: string, alt: string) => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`,
  alt,
});

export const SEO_PAGES: SeoPageConfig[] = [
  {
    slug: "intercom-alternative",
    title: "Intercom Alternative",
    heroImage: UNSPLASH("1556742049-0cfed4f6a45d", "AI-powered customer chat and support"),
    metaTitle: "Qurieus - Best Intercom Alternative | AI-Powered Customer Chat",
    metaDescription:
      "Looking for an Intercom alternative? Qurieus offers AI-powered live chat with agentic capabilities—escalate to human agents when needed. Knowledge base search and document Q&A. Try free.",
    h1: "Qurieus: The Smart Intercom Alternative for AI-Powered Support",
    heroDescription:
      "Replace Intercom with Qurieus—an AI-powered chat platform that answers from your docs, knowledge base, and website. No per-seat pricing. Embed in minutes.",
    sections: [
      {
        heading: "Why Switch from Intercom to Qurieus?",
        content:
          "Intercom is powerful but expensive. Qurieus gives you AI that actually knows your product—trained on your documents, FAQs, and knowledge base. Visitors get instant answers without waiting for an agent.",
        bullets: [
          "AI answers from your docs—no manual script writing",
          "Affordable pricing without per-seat limits",
          "Embed on any website in minutes",
          "Works with WordPress, Shopify, and custom sites",
        ],
      },
      {
        heading: "Key Features That Match or Beat Intercom",
        content:
          "Qurieus combines live chat with AI-powered document Q&A. Upload your help docs, product guides, and FAQs—your chat widget answers questions 24/7 from your own content.",
        bullets: [
          "Knowledge base chat and document search",
          "Customizable chat widget and branding",
          "Multi-language support",
          "Analytics and conversation insights",
        ],
      },
      {
        heading: "Get Started in Minutes",
        content:
          "No complex setup. Upload your documents, add the embed code to your site, and your AI chat is live. Start your free trial today.",
      },
    ],
    keywords: [
      "intercom alternative",
      "intercom replacement",
      "cheap intercom alternative",
      "AI customer support",
      "intercom competitor",
      "agentic AI chat",
      "human agent escalation",
      "AI to human handoff",
    ],
    faqs: [
      { question: "Is Qurieus cheaper than Intercom?", answer: "Yes. Qurieus offers AI-powered chat at a fraction of Intercom's pricing, with no per-seat limits on AI conversations." },
      { question: "Can Qurieus replace Intercom?", answer: "Yes. Qurieus provides AI chat trained on your docs, knowledge base search, and website embedding—ideal for teams that want to reduce support costs while maintaining quality." },
      { question: "Can I embed Qurieus on my website like Intercom?", answer: "Yes. Add one line of code to your site and your AI chat widget goes live. Works on WordPress, Shopify, and any custom site." },
    ],
  },
  {
    slug: "live-chat-for-website",
    title: "Live Chat for Website",
    heroImage: UNSPLASH("1516321318423-f06f85e504b3", "Live chat widget on website"),
    metaTitle: "Live Chat for Website | AI-Powered Chat Widget - Qurieus",
    metaDescription:
      "Add live chat to your website in minutes. Qurieus AI chat answers from your docs 24/7. Agentic: escalate to human agents when needed. Free trial. Works on any website—WordPress, Shopify, custom.",
    h1: "Live Chat for Website: AI That Knows Your Business",
    heroDescription:
      "Add a chat widget to your website that answers visitor questions instantly—powered by your documents, FAQs, and knowledge base. No coding required.",
    sections: [
      {
        heading: "Why Add Live Chat to Your Website?",
        content:
          "Visitors expect instant answers. Qurieus live chat gives them 24/7 support powered by AI trained on your content. Reduce bounce rates and convert more leads.",
        bullets: [
          "Instant answers from your docs and FAQs",
          "24/7 availability—no agent needed",
          "Increases engagement and conversions",
          "Easy embed—works on any website",
        ],
      },
      {
        heading: "How It Works",
        content:
          "Upload your PDFs, help docs, or product guides. Add one line of code to your site. Your chat widget goes live and answers questions in real time.",
        bullets: [
          "Upload documents or connect your knowledge base",
          "Copy-paste embed code to your website",
          "Customize widget appearance and position",
          "Monitor conversations and improve answers",
        ],
      },
      {
        heading: "Works Everywhere",
        content:
          "Qurieus chat works on WordPress, Shopify, Wix, Squarespace, and any custom HTML site. One embed, all platforms.",
      },
    ],
    keywords: [
      "live chat for website",
      "website chat widget",
      "add chat to website",
      "live chat software",
      "chat widget",
      "agentic chat",
      "AI to human agent escalation",
    ],
    faqs: [
      { question: "How do I add live chat to my website?", answer: "Upload your docs or FAQs to Qurieus, then copy the embed code and paste it into your website. Your AI chat is live in minutes." },
      { question: "Does Qurieus work on any website?", answer: "Yes. Qurieus works on WordPress, Shopify, Wix, Squarespace, and any custom HTML site. One embed code works everywhere." },
      { question: "Is the chat widget free?", answer: "Qurieus offers a free trial. After that, pricing is straightforward with no per-seat limits on AI conversations." },
    ],
  },
  {
    slug: "chat-widget-for-wordpress",
    title: "Chat Widget for WordPress",
    heroImage: UNSPLASH("1461749280684-dccba630e2f6", "WordPress website with chat widget"),
    metaTitle: "Chat Widget for WordPress | AI Chat Plugin - Qurieus",
    metaDescription:
      "Add an AI chat widget to your WordPress site in minutes. Qurieus answers from your content 24/7. No plugin bloat. Free trial.",
    h1: "AI Chat Widget for WordPress—Simple & Powerful",
    heroDescription:
      "Add a smart chat widget to your WordPress site that answers visitor questions from your pages, posts, and documents. One embed, zero plugins.",
    sections: [
      {
        heading: "The Easiest WordPress Chat Solution",
        content:
          "No heavy plugins. No database bloat. Just add Qurieus embed code to your theme or use a simple shortcode. Your AI chat is live in under 5 minutes.",
        bullets: [
          "Copy-paste embed—no plugin installation",
          "AI trained on your WordPress content",
          "Lightweight—no impact on page speed",
          "Works with any WordPress theme",
        ],
      },
      {
        heading: "Train Your Chat on Your Content",
        content:
          "Connect your blog posts, product pages, and help docs. Qurieus crawls your site or you upload PDFs. Your chat answers from your actual content—not generic responses.",
        bullets: [
          "Website crawler for automatic content sync",
          "Manual document upload (PDF, DOCX)",
          "FAQ and knowledge base support",
          "Multi-language ready",
        ],
      },
      {
        heading: "Perfect for WooCommerce & Membership Sites",
        content:
          "Use Qurieus to answer product questions, shipping info, and account FAQs. Reduce support tickets and improve customer experience.",
      },
    ],
    keywords: [
      "chat widget for WordPress",
      "WordPress chat plugin",
      "AI chat WordPress",
      "WordPress live chat",
      "chat plugin WordPress",
    ],
    faqs: [
      { question: "Do I need a WordPress plugin for Qurieus?", answer: "No. Qurieus uses a simple embed code—no plugin required. Add it to your theme's footer or use a custom HTML block." },
      { question: "Will the chat widget slow down my WordPress site?", answer: "No. The Qurieus widget is lightweight and loads asynchronously, so it won't impact your page speed." },
      { question: "Can I customize the chat widget appearance?", answer: "Yes. You can customize colors, position, and the initial message to match your brand." },
    ],
  },
  {
    slug: "customer-support-chat",
    title: "Customer Support Chat",
    heroImage: UNSPLASH("1521791055366-0d553872125f", "Customer support team with AI chat"),
    metaTitle: "Customer Support Chat | AI-Powered 24/7 Support - Qurieus",
    metaDescription:
      "Upgrade your customer support with AI chat. Qurieus answers from your docs, FAQs, and knowledge base 24/7. Agentic: escalate to human agents when needed. Reduce tickets, improve satisfaction.",
    h1: "Customer Support Chat Powered by AI",
    heroDescription:
      "Give your customers instant answers from your help docs, product guides, and FAQs. Qurieus AI support chat reduces ticket volume and improves satisfaction.",
    sections: [
      {
        heading: "Transform Your Customer Support",
        content:
          "Stop repeating the same answers. Qurieus learns from your documentation and delivers accurate, consistent support 24/7. Free your team for complex issues.",
        bullets: [
          "AI answers from your knowledge base",
          "24/7 availability",
          "Reduces repetitive support tickets",
          "Escalation to human agents when needed",
        ],
      },
      {
        heading: "How Qurieus Supports Your Team",
        content:
          "Upload your help docs, product manuals, and FAQs. Qurieus indexes everything and answers customer questions with citations. Your agents focus on high-value conversations.",
        bullets: [
          "Document Q&A with source citations",
          "Conversation history and analytics",
          "Customizable responses and branding",
          "Integrates with your existing workflow",
        ],
      },
      {
        heading: "Start Improving Support Today",
        content:
          "Get your AI support chat live in minutes. Upload docs, embed on your site or help center, and watch ticket volume drop.",
      },
    ],
    keywords: [
      "customer support chat",
      "AI customer support",
      "support chat software",
      "24/7 customer support",
      "chat support",
      "agentic chat support",
      "human agent escalation",
      "hybrid AI and human support",
    ],
    faqs: [
      { question: "How does AI customer support work?", answer: "Qurieus AI is trained on your help docs, FAQs, and product guides. It answers customer questions 24/7 with accurate, context-aware responses." },
      { question: "Can Qurieus reduce support tickets?", answer: "Yes. Many teams see 30–50% fewer tickets as AI handles common questions from your knowledge base." },
      { question: "Can customers still talk to a human agent?", answer: "Yes. Qurieus can be configured to escalate to human agents when needed." },
    ],
  },
  {
    slug: "zendesk-alternative",
    title: "Zendesk Alternative",
    heroImage: UNSPLASH("1552664730-d307ca884978", "Help desk and support team"),
    metaTitle: "Qurieus - Best Zendesk Alternative | AI Support Chat",
    metaDescription:
      "Looking for a Zendesk alternative? Qurieus offers AI-powered support chat from your docs at a fraction of the cost. No per-agent pricing.",
    h1: "Qurieus: The Affordable Zendesk Alternative",
    heroDescription:
      "Replace Zendesk with AI that knows your product. Qurieus answers from your docs and knowledge base—no expensive per-agent seats.",
    sections: [
      {
        heading: "Why Choose Qurieus Over Zendesk?",
        content:
          "Zendesk pricing scales with agents. Qurieus scales with AI—one subscription, unlimited conversations. Train it on your help center and product docs.",
        bullets: [
          "No per-agent pricing—unlimited AI conversations",
          "AI trained on your Zendesk articles (export & upload)",
          "Embed on website, help center, or app",
          "Simple setup—no complex integrations",
        ],
      },
      {
        heading: "Migrate from Zendesk Easily",
        content:
          "Export your Zendesk help articles or upload PDFs. Qurieus indexes your content and your new AI support is live. Keep your team for escalations.",
        bullets: [
          "Import existing help docs and FAQs",
          "Website crawler for help centers",
          "Same quality answers, lower cost",
          "Add human handoff when needed",
        ],
      },
      {
        heading: "Try Qurieus Free",
        content:
          "Start your free trial. No credit card required. See how Qurieus can replace or complement your Zendesk setup.",
      },
    ],
    keywords: [
      "zendesk alternative",
      "zendesk replacement",
      "cheap zendesk alternative",
      "AI help desk",
      "zendesk competitor",
    ],
    faqs: [
      { question: "Can I migrate from Zendesk to Qurieus?", answer: "Yes. Export your Zendesk help articles or upload PDFs. Qurieus indexes your content and your AI support is live." },
      { question: "Does Qurieus integrate with Zendesk?", answer: "Qurieus can run standalone or alongside Zendesk. Use it for AI chat while keeping Zendesk for human agents." },
      { question: "Is Qurieus cheaper than Zendesk?", answer: "Yes. Qurieus offers AI-powered support at a fraction of Zendesk's per-agent pricing." },
    ],
  },
  {
    slug: "ai-chatbot-for-website",
    title: "AI Chatbot for Website",
    heroImage: UNSPLASH("1506744038136-46273834b3fb", "AI chatbot and artificial intelligence"),
    metaTitle: "AI Chatbot for Website | Train on Your Content - Qurieus",
    metaDescription:
      "Add an AI chatbot to your website trained on your content. Qurieus answers from your docs, FAQs, and pages. Free trial. No coding.",
    h1: "AI Chatbot for Website—Trained on Your Content",
    heroDescription:
      "Most chatbots give generic answers. Qurieus learns from your documents, FAQs, and website—delivering accurate, on-brand responses every time.",
    sections: [
      {
        heading: "Your Content, Your AI",
        content:
          "Upload PDFs, connect your knowledge base, or let Qurieus crawl your site. Your chatbot answers from your actual content—not canned scripts.",
        bullets: [
          "Train on documents, FAQs, and web pages",
          "Accurate answers with source citations",
          "Customizable personality and branding",
          "Multi-language support",
        ],
      },
      {
        heading: "Why Businesses Choose Qurieus",
        content:
          "Generic chatbots frustrate users. Qurieus understands your product, your policies, and your tone. Visitors get real help, not runarounds.",
        bullets: [
          "Reduces support load and bounce rates",
          "Increases conversions and engagement",
          "Works 24/7 without agents",
          "Easy embed—any website, any platform",
        ],
      },
      {
        heading: "Get Your AI Chatbot Live",
        content:
          "Sign up, upload your content, add the embed code. Your AI chatbot is live in under 10 minutes.",
      },
    ],
    keywords: [
      "AI chatbot for website",
      "website chatbot",
      "AI chat widget",
      "chatbot for business",
      "custom AI chatbot",
      "agentic AI chatbot",
      "chat escalate to human agent",
    ],
    faqs: [
      { question: "How do I train the chatbot on my content?", answer: "Upload your PDFs, help docs, or product pages. Qurieus indexes everything and answers from your actual content—not generic scripts." },
      { question: "Can the chatbot answer in multiple languages?", answer: "Yes. Qurieus supports multi-language content and can respond in the language of your content." },
      { question: "How accurate are the AI answers?", answer: "Answers are based on your documents—so they match your content. Qurieus also provides source citations for transparency." },
    ],
  },
  {
    slug: "crisp-alternative",
    title: "Crisp Alternative",
    heroImage: UNSPLASH("1507679799987-c73779587ccf", "Live chat on laptop"),
    metaTitle: "Qurieus - Best Crisp Alternative | AI Live Chat",
    metaDescription:
      "Looking for a Crisp alternative? Qurieus offers AI-powered chat from your docs. Smarter answers, simpler pricing. Try free.",
    h1: "Qurieus: The Smarter Crisp Alternative",
    heroDescription:
      "Crisp is great for live chat. Qurieus adds AI that answers from your docs—so visitors get instant help even when your team is offline.",
    sections: [
      {
        heading: "Crisp + AI = Qurieus",
        content:
          "Keep the chat widget experience. Add AI that actually knows your product. Qurieus combines live chat with document-powered Q&A.",
        bullets: [
          "AI answers from your docs and FAQs",
          "Chat widget for website—same UX as Crisp",
          "No per-seat limits on AI conversations",
          "Simple, transparent pricing",
        ],
      },
      {
        heading: "Easy Migration",
        content:
          "Export your Crisp FAQs or upload your help docs. Qurieus gets your AI live in minutes. Keep your existing chat for human handoff.",
        bullets: [
          "Import FAQs and knowledge base content",
          "One-line embed code",
          "Customize colors and position",
          "Analytics and conversation logs",
        ],
      },
      {
        heading: "Try Qurieus Today",
        content:
          "Start free. No credit card. See how Qurieus compares to Crisp for your use case.",
      },
    ],
    keywords: [
      "crisp alternative",
      "crisp replacement",
      "crisp competitor",
      "AI live chat",
      "crisp chat alternative",
    ],
    faqs: [
      { question: "How does Qurieus compare to Crisp?", answer: "Qurieus adds AI that answers from your docs—so visitors get instant help even when your team is offline. Crisp is great for live chat; Qurieus adds AI-powered Q&A." },
      { question: "Can I use Qurieus with Crisp?", answer: "Yes. Qurieus can run alongside Crisp for AI answers while Crisp handles human chat." },
      { question: "Is Qurieus cheaper than Crisp?", answer: "Qurieus offers a free trial and straightforward pricing. Compare plans to find the best fit for your needs." },
    ],
  },
  {
    slug: "live-chat-for-shopify",
    title: "Live Chat for Shopify",
    heroImage: UNSPLASH("1519389950473-47ba0277781c", "Ecommerce store with chat support"),
    metaTitle: "Live Chat for Shopify | AI Chat Widget - Qurieus",
    metaDescription:
      "Add AI live chat to your Shopify store. Qurieus answers product, shipping, and policy questions from your content. Free trial.",
    h1: "Live Chat for Shopify—AI That Sells",
    heroDescription:
      "Add a chat widget to your Shopify store that answers product questions, shipping info, and return policies—powered by your store content.",
    sections: [
      {
        heading: "Boost Shopify Sales with AI Chat",
        content:
          "Shoppers have questions. Qurieus answers from your product descriptions, FAQs, and policies. Instant help = more conversions.",
        bullets: [
          "Answers product and shipping questions",
          "Trained on your store pages and policies",
          "24/7—no staff needed",
          "Increases cart completion rate",
        ],
      },
      {
        heading: "Simple Shopify Integration",
        content:
          "Add Qurieus to your Shopify theme in one step. No app store bloat. Your chat is live and answering in minutes.",
        bullets: [
          "One embed in theme.liquid",
          "Works with all Shopify themes",
          "Mobile-friendly chat widget",
          "No impact on store speed",
        ],
      },
      {
        heading: "Start Your Free Trial",
        content:
          "Connect your Shopify store or upload product docs. Your AI chat goes live today.",
      },
    ],
    keywords: [
      "live chat for Shopify",
      "Shopify chat app",
      "AI chat Shopify",
      "Shopify chat widget",
      "chat for Shopify store",
    ],
    faqs: [
      { question: "How do I add Qurieus to my Shopify store?", answer: "Add the embed code to your theme.liquid file. One line of code and your AI chat is live." },
      { question: "Does Qurieus work with Shopify themes?", answer: "Yes. Qurieus works with all Shopify themes—Dawn, Debut, and custom themes." },
      { question: "Can Qurieus answer product questions?", answer: "Yes. Train it on your product descriptions, FAQs, and policies. It answers shipping, returns, and product questions 24/7." },
    ],
  },
  {
    slug: "help-desk-chat",
    title: "Help Desk Chat",
    heroImage: UNSPLASH("1522071820081-009f0129c71c", "Help desk team collaboration"),
    metaTitle: "Help Desk Chat | AI-Powered Support - Qurieus",
    metaDescription:
      "Upgrade your help desk with AI chat. Qurieus answers from your knowledge base 24/7. Reduce tickets, improve resolution time.",
    h1: "Help Desk Chat Powered by AI",
    heroDescription:
      "Give your help desk an AI assistant. Qurieus answers Tier 1 questions from your docs—freeing agents for complex issues.",
    sections: [
      {
        heading: "Smarter Help Desk Support",
        content:
          "Most help desk tickets are repetitive. Qurieus AI handles common questions from your knowledge base—instantly and accurately.",
        bullets: [
          "AI answers from help docs and FAQs",
          "Reduces ticket volume by 30–50%",
          "Faster first response time",
          "Agent escalation when needed",
        ],
      },
      {
        heading: "Integrates With Your Workflow",
        content:
          "Use Qurieus alongside Zendesk, Freshdesk, or your custom help desk. AI handles chat; your team handles escalations.",
        bullets: [
          "Standalone or integrated chat",
          "Conversation history for agents",
          "Analytics and improvement insights",
          "API for custom integrations",
        ],
      },
      {
        heading: "Get Started",
        content:
          "Upload your help docs. Embed the chat. Your AI help desk is live.",
      },
    ],
    keywords: [
      "help desk chat",
      "AI help desk",
      "help desk software",
      "support chat",
      "help desk support",
    ],
    faqs: [
      { question: "How does AI help desk chat work?", answer: "Qurieus AI answers Tier 1 questions from your knowledge base—instantly and accurately. Agents handle complex issues." },
      { question: "Can Qurieus integrate with my help desk?", answer: "Qurieus offers a standalone chat or can work alongside Zendesk, Freshdesk, or custom help desks." },
      { question: "Will AI reduce our ticket volume?", answer: "Many teams see 30–50% fewer tickets as AI handles common questions from your docs." },
    ],
  },
  {
    slug: "chatbot-for-customer-service",
    title: "Chatbot for Customer Service",
    heroImage: UNSPLASH("1551431009-a802eeec77b1", "Customer service and support"),
    metaTitle: "Chatbot for Customer Service | AI Support - Qurieus",
    metaDescription:
      "Deploy an AI chatbot for customer service. Qurieus answers from your docs and FAQs. Reduce tickets, improve satisfaction. Free trial.",
    h1: "Chatbot for Customer Service—Trained on Your Docs",
    heroDescription:
      "Deploy a customer service chatbot that actually helps. Qurieus learns from your documentation and delivers accurate, helpful responses.",
    sections: [
      {
        heading: "Customer Service That Scales",
        content:
          "Agents can't be everywhere. Qurieus chatbot handles common questions 24/7—from returns and shipping to product how-tos.",
        bullets: [
          "Trained on your policies and FAQs",
          "Consistent, accurate answers",
          "Reduces average handle time",
          "Improves CSAT scores",
        ],
      },
      {
        heading: "From Generic to Specific",
        content:
          "Generic chatbots frustrate customers. Qurieus is trained on your content—so it gives answers that match your brand and policies.",
        bullets: [
          "Document and FAQ training",
          "Source citations for transparency",
          "Human handoff when needed",
          "Multi-channel ready",
        ],
      },
      {
        heading: "Try Qurieus Free",
        content:
          "Upload your docs. Embed the chatbot. See the difference in your support metrics.",
      },
    ],
    keywords: [
      "chatbot for customer service",
      "customer service chatbot",
      "AI customer service",
      "support chatbot",
      "customer support AI",
      "agentic customer service",
      "AI escalate to human agent",
    ],
    faqs: [
      { question: "What makes a good customer service chatbot?", answer: "A good chatbot is trained on your content—so it gives accurate, on-brand answers. Qurieus learns from your docs and FAQs." },
      { question: "Can the chatbot handle complex questions?", answer: "Qurieus handles common questions from your docs. For complex issues, escalate to human agents." },
      { question: "How do I add a chatbot to my website?", answer: "Upload your docs to Qurieus, add the embed code to your site, and your AI chatbot is live." },
    ],
  },
  {
    slug: "tawk-alternative",
    title: "Tawk Alternative",
    heroImage: UNSPLASH("1531482615713-2afd69097998", "Live chat widget on website"),
    metaTitle: "Qurieus - Best Tawk Alternative | AI-Powered Live Chat",
    metaDescription:
      "Looking for a Tawk alternative? Qurieus offers AI-powered chat from your docs. No ads, smarter answers. Free trial.",
    h1: "Qurieus: The Smart Tawk Alternative for AI-Powered Chat",
    heroDescription:
      "Tawk is free but shows ads. Qurieus gives you AI that answers from your docs—no ads, no branding. Professional support at an affordable price.",
    sections: [
      {
        heading: "Why Switch from Tawk to Qurieus?",
        content:
          "Tawk is free but comes with ads and limitations. Qurieus offers AI-powered chat trained on your content—no ads, no Tawk branding. Professional support at a fraction of enterprise tools.",
        bullets: [
          "AI answers from your docs—no manual script writing",
          "No ads or third-party branding",
          "Customizable chat widget",
          "Works with WordPress, Shopify, and custom sites",
        ],
      },
      {
        heading: "Key Features",
        content:
          "Upload your help docs, product guides, and FAQs. Qurieus indexes everything and answers visitor questions 24/7 from your own content.",
        bullets: [
          "Knowledge base chat and document Q&A",
          "Custom branding and colors",
          "Analytics and conversation insights",
          "Simple embed—one line of code",
        ],
      },
      {
        heading: "Get Started",
        content:
          "Upload your documents, add the embed code, and your AI chat is live. Start your free trial today.",
      },
    ],
    keywords: [
      "tawk alternative",
      "tawk replacement",
      "tawk competitor",
      "AI live chat",
      "tawk.to alternative",
    ],
    faqs: [
      { question: "Is Qurieus free like Tawk?", answer: "Qurieus offers a free trial. After that, pricing is straightforward—no ads, no third-party branding." },
      { question: "Does Qurieus show ads?", answer: "No. Qurieus has no ads and no third-party branding. Your chat is fully professional." },
      { question: "Can I migrate from Tawk to Qurieus?", answer: "Yes. Export your Tawk FAQs or upload your help docs. Qurieus gets your AI live in minutes." },
    ],
  },
  {
    slug: "drift-alternative",
    title: "Drift Alternative",
    heroImage: UNSPLASH("1515378791036-0648a3ef77b2", "Conversational chat and messaging"),
    metaTitle: "Qurieus - Best Drift Alternative | AI Conversational Chat",
    metaDescription:
      "Looking for a Drift alternative? Qurieus offers AI-powered chat from your docs. Affordable, easy to set up. Free trial.",
    h1: "Qurieus: The Affordable Drift Alternative",
    heroDescription:
      "Drift is powerful but expensive. Qurieus gives you AI that knows your product—trained on your docs, FAQs, and knowledge base. Same conversational experience, lower cost.",
    sections: [
      {
        heading: "Why Choose Qurieus Over Drift?",
        content:
          "Drift is built for enterprise sales. Qurieus is built for support—AI that answers from your docs. No complex setup, no per-seat pricing.",
        bullets: [
          "AI trained on your documents and FAQs",
          "Affordable pricing without per-seat limits",
          "Embed on any website in minutes",
          "Conversation analytics included",
        ],
      },
      {
        heading: "Key Features",
        content:
          "Qurieus combines conversational chat with AI-powered document Q&A. Upload your content, embed the widget, and your visitors get instant answers.",
        bullets: [
          "Document and knowledge base Q&A",
          "Customizable chat widget",
          "24/7 availability",
          "Human handoff when needed",
        ],
      },
      {
        heading: "Try Qurieus Free",
        content:
          "Start your free trial. No credit card required. See how Qurieus compares to Drift for your use case.",
      },
    ],
    keywords: [
      "drift alternative",
      "drift replacement",
      "drift competitor",
      "conversational chat",
      "chatbot alternative",
    ],
    faqs: [
      { question: "Is Qurieus cheaper than Drift?", answer: "Yes. Qurieus offers AI-powered chat at a fraction of Drift's pricing." },
      { question: "Can Qurieus do conversational marketing like Drift?", answer: "Qurieus focuses on AI-powered support chat from your docs. For sales conversations, Drift may be a fit; for support, Qurieus is ideal." },
      { question: "How fast can I embed Qurieus?", answer: "Upload your docs or FAQs, add the embed code to your site, and your chat is live in under 10 minutes." },
    ],
  },
  {
    slug: "freshdesk-alternative",
    title: "Freshdesk Alternative",
    heroImage: UNSPLASH("1519389950473-47ba0277781c", "Help desk and document support"),
    metaTitle: "Qurieus - Best Freshdesk Alternative | AI Support Chat",
    metaDescription:
      "Looking for a Freshdesk alternative? Qurieus offers AI-powered support chat from your docs. Reduce tickets, lower cost. Free trial.",
    h1: "Qurieus: The AI-Powered Freshdesk Alternative",
    heroDescription:
      "Replace or complement Freshdesk with Qurieus—AI that answers from your help docs and FAQs. Reduce ticket volume and support costs.",
    sections: [
      {
        heading: "Why Switch from Freshdesk to Qurieus?",
        content:
          "Freshdesk is great for human agents. Qurieus adds AI that handles Tier 1 questions from your knowledge base—instantly and accurately. Use together or replace for simpler setups.",
        bullets: [
          "AI answers from your Freshdesk articles (export & upload)",
          "No per-agent pricing for AI conversations",
          "Embed on website or help center",
          "Simple setup—no complex integrations",
        ],
      },
      {
        heading: "Migrate Easily",
        content:
          "Export your Freshdesk help articles or upload PDFs. Qurieus indexes your content and your AI support is live. Keep your team for escalations.",
        bullets: [
          "Import existing help docs and FAQs",
          "Website crawler for help centers",
          "Same quality answers, lower cost",
          "Add human handoff when needed",
        ],
      },
      {
        heading: "Get Started",
        content:
          "Upload your docs. Embed the chat. Your AI support is live in minutes.",
      },
    ],
    keywords: [
      "freshdesk alternative",
      "freshdesk replacement",
      "freshdesk competitor",
      "AI help desk",
      "support chat software",
    ],
    faqs: [
      { question: "Can I migrate from Freshdesk to Qurieus?", answer: "Yes. Export your Freshdesk articles or upload PDFs. Qurieus indexes your content and your AI support is live." },
      { question: "Does Qurieus integrate with Freshdesk?", answer: "Qurieus can run standalone or alongside Freshdesk. Use it for AI chat while keeping Freshdesk for human agents." },
      { question: "Is Qurieus cheaper than Freshdesk?", answer: "Yes. Qurieus offers AI-powered support at a fraction of Freshdesk's per-agent pricing." },
    ],
  },
  {
    slug: "live-chat-software",
    title: "Live Chat Software",
    heroImage: UNSPLASH("1460925895917-afdab827c52f", "Live chat software dashboard"),
    metaTitle: "Live Chat Software | AI-Powered - Qurieus",
    metaDescription:
      "Best live chat software with AI. Qurieus answers from your docs 24/7. Embed on any website. Free trial. No per-seat limits.",
    h1: "Live Chat Software with AI That Knows Your Business",
    heroDescription:
      "Add live chat software to your website that answers instantly—powered by AI trained on your documents, FAQs, and knowledge base. No agents needed for common questions.",
    sections: [
      {
        heading: "Why Choose Qurieus Live Chat Software?",
        content:
          "Most live chat software requires agents to be online. Qurieus gives you AI that answers from your docs 24/7—so visitors get instant help even when your team is offline.",
        bullets: [
          "AI answers from your docs and FAQs",
          "24/7 availability—no agent needed",
          "Works on any website",
          "Customizable widget and branding",
        ],
      },
      {
        heading: "How It Works",
        content:
          "Upload your PDFs, help docs, or product guides. Add one line of code to your site. Your live chat software is live and answering questions in real time.",
        bullets: [
          "Upload documents or connect knowledge base",
          "Copy-paste embed code to your website",
          "Customize appearance and position",
          "Monitor conversations and improve answers",
        ],
      },
      {
        heading: "Get Started",
        content:
          "Sign up, upload your content, add the embed code. Your AI live chat is live in under 10 minutes.",
      },
    ],
    keywords: [
      "live chat software",
      "live chat tool",
      "live chat solution",
      "AI live chat",
      "chat software",
      "agentic live chat",
      "AI to human agent handoff",
    ],
    faqs: [
      { question: "What is the best live chat software?", answer: "The best live chat software depends on your needs. Qurieus is ideal if you want AI that answers from your docs 24/7—no agents needed." },
      { question: "Can live chat work without agents?", answer: "Yes. Qurieus AI answers from your documents and FAQs—so visitors get instant help even when your team is offline." },
      { question: "How much does live chat software cost?", answer: "Qurieus offers a free trial and straightforward pricing. No per-seat limits on AI conversations." },
    ],
  },
  {
    slug: "chat-support-software",
    title: "Chat Support Software",
    heroImage: UNSPLASH("1519389950473-47ba0277781c", "Chat support and document Q&A"),
    metaTitle: "Chat Support Software | AI-Powered - Qurieus",
    metaDescription:
      "Chat support software with AI. Qurieus answers from your docs 24/7. Reduce tickets, improve satisfaction. Free trial.",
    h1: "Chat Support Software Powered by AI",
    heroDescription:
      "Upgrade your chat support with AI. Qurieus answers from your help docs, product guides, and FAQs—reducing ticket volume and improving customer satisfaction.",
    sections: [
      {
        heading: "Transform Your Chat Support",
        content:
          "Stop repeating the same answers. Qurieus learns from your documentation and delivers accurate, consistent support 24/7. Free your team for complex issues.",
        bullets: [
          "AI answers from your knowledge base",
          "24/7 availability",
          "Reduces repetitive support tickets",
          "Escalation to human agents when needed",
        ],
      },
      {
        heading: "How Qurieus Supports Your Team",
        content:
          "Upload your help docs, product manuals, and FAQs. Qurieus indexes everything and answers customer questions with citations. Your agents focus on high-value conversations.",
        bullets: [
          "Document Q&A with source citations",
          "Conversation history and analytics",
          "Customizable responses and branding",
          "Integrates with your existing workflow",
        ],
      },
      {
        heading: "Start Improving Support Today",
        content:
          "Get your AI chat support live in minutes. Upload docs, embed on your site or help center, and watch ticket volume drop.",
      },
    ],
    keywords: [
      "chat support software",
      "support chat tool",
      "live chat support",
      "AI support chat",
      "customer chat support",
      "agentic chat support",
      "human agent escalation",
    ],
    faqs: [
      { question: "What is chat support software?", answer: "Chat support software lets customers get help via chat. Qurieus adds AI that answers from your docs—so support is instant and 24/7." },
      { question: "Can chat support reduce ticket volume?", answer: "Yes. Qurieus AI handles common questions from your knowledge base—many teams see 30–50% fewer tickets." },
      { question: "How do I add chat support to my website?", answer: "Upload your docs to Qurieus, add the embed code to your site, and your AI chat support is live." },
    ],
  },
];
