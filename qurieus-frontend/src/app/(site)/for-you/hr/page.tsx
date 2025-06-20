import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Common/Breadcrumb';
import TryForFreeButton from '@/components/Common/TryForFreeButton';

const HRPage = () => (
  <main>
    <Breadcrumb pageName="For HR" />
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Revolutionizing HR with AI</h1>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="HR team collaborating"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The HR Professional&apos;s Dilemma</h2>
        <p className="text-lg">
          HR teams are the backbone of every organization, but they face a mountain of paperwork: resumes, compliance documents, onboarding forms, and more. Sifting through this data manually is slow, error-prone, and keeps HR from focusing on people.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How Qurieus Empowers HR</h2>
        <p className="text-lg">
          Qurieus brings AI to your HR toolkit, automating document search, candidate screening, and compliance checks. Instantly find the right resume, summarize policy changes, or extract key onboarding details—all in seconds.
        </p>
        <ul className="list-disc ml-6 mt-4 text-lg space-y-2">
          <li>AI-driven resume and document search</li>
          <li>Automated compliance and policy review</li>
          <li>Bulk onboarding document processing</li>
          <li>Confidential and secure data handling</li>
        </ul>
      </section>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="AI in HR analytics"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Experience the Future of HR</h2>
        <p className="text-lg mb-4">
          Upload a batch of resumes or policy documents, ask Qurieus to find top candidates or summarize compliance gaps, and see how AI can transform your HR workflow.
        </p>
        <p className="text-lg mb-4">
          Free your HR team from paperwork and let them focus on what matters most—your people.
        </p>
      </section>

      <section className="text-center">
        <TryForFreeButton />
      </section>
    </div>
  </main>
);

export default HRPage; 