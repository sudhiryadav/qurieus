import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Common/Breadcrumb';

const StartupsPage = () => (
  <main>
    <Breadcrumb pageName="For Startups" />
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Startups: Move Fast, Stay Smart with AI</h1>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Startup team brainstorming"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The Startup Hustle</h2>
        <p className="text-lg">
          Founders and startup teams juggle pitch decks, investor docs, legal agreements, and product specs—often all at once. Missing a key detail or spending hours searching for info can mean lost opportunities or costly mistakes.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How Qurieus Accelerates Startups</h2>
        <p className="text-lg">
          Qurieus gives startups an AI-powered edge: instantly search, summarize, and extract insights from all your critical documents. Focus on growth, not paperwork.
        </p>
        <ul className="list-disc ml-6 mt-4 text-lg space-y-2">
          <li>Instant pitch deck and investor doc search</li>
          <li>Summaries of legal agreements and contracts</li>
          <li>Key term extraction from product specs</li>
          <li>Secure, confidential file handling</li>
        </ul>
      </section>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="AI for startup growth"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">See Qurieus in Action</h2>
        <p className="text-lg mb-4">
          Upload your pitch deck, investor agreement, or product spec, and ask Qurieus to highlight key terms or summarize the main points. See how fast you can get answers and move forward.
        </p>
        <p className="text-lg mb-4">
          Don&apos;t let paperwork slow your startup. Let Qurieus be your AI co-founder.
        </p>
      </section>

      <section className="text-center">
        <Link href="/upload" className="inline-block bg-primary text-white px-6 py-3 rounded hover:bg-primary-dark transition">
          Try Qurieus with Your Own Files
        </Link>
      </section>
    </div>
  </main>
);

export default StartupsPage; 