import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Common/Breadcrumb';

const SaaSPage = () => (
  <main>
    <Breadcrumb pageName="For SaaS" />
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Supercharge SaaS Operations with AI</h1>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="SaaS team working on laptops"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The SaaS Scaling Challenge</h2>
        <p className="text-lg">
          SaaS companies thrive on innovation, but are often bogged down by mountains of technical docs, customer contracts, and support tickets. Finding the right info fast is critical for both teams and customers.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How Qurieus Accelerates SaaS Teams</h2>
        <p className="text-lg">
          Qurieus uses AI to instantly search, summarize, and extract insights from your technical docs, contracts, and support logs. Empower your team to resolve issues faster, onboard customers smoothly, and keep your knowledge base up to date.
        </p>
        <ul className="list-disc ml-6 mt-4 text-lg space-y-2">
          <li>Lightning-fast document and ticket search</li>
          <li>Automated summaries of technical documentation</li>
          <li>Insight extraction from customer feedback</li>
          <li>Secure handling of sensitive SaaS data</li>
        </ul>
      </section>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="AI-powered SaaS analytics"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">See Qurieus in Action</h2>
        <p className="text-lg mb-4">
          Upload your API docs, support logs, or customer feedback, and ask Qurieus to summarize key issues or find specific solutions. Experience how AI can boost your SaaS productivity.
        </p>
        <p className="text-lg mb-4">
          Let your team focus on building great products—Qurieus will handle the paperwork.
        </p>
      </section>

      <section className="text-center">
        <Link href="/user/knowledge-base" className="inline-block bg-primary text-white px-6 py-3 rounded hover:bg-primary-dark transition">
          Try Qurieus with Your Own Files
        </Link>
      </section>
    </div>
  </main>
);

export default SaaSPage; 