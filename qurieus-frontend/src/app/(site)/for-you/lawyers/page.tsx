import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Common/Breadcrumb';
import TryForFreeButton from '@/components/Common/TryForFreeButton';

const LawyersPage = () => (
  <main>
    <Breadcrumb pageName="For Lawyers" />
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Empowering Lawyers with AI</h1>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1551135049-8a33b5883817?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Lawyer reviewing documents"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">The Modern Lawyer&apos;s Challenge</h2>
        <p className="text-lg">
          Today&apos;s legal professionals are under constant pressure to manage overwhelming volumes of contracts, case files, and compliance documents. From reviewing lengthy agreements to identifying crucial clauses and timelines, this manual process is not only time-intensive but also increases the risk of oversight.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How Qurieus Makes a Difference</h2>
        <p className="text-lg">
          Qurieus leverages advanced AI to streamline your legal document workflow. Whether you need to summarize a 100-page contract in seconds or search for specific clauses across multiple files, Qurieus delivers instant, accurate results — helping you focus on strategy, not paperwork.
        </p>
        <ul className="list-disc ml-6 mt-4 text-lg space-y-2">
          <li>AI-powered document search and clause extraction</li>
          <li>Instant summaries of long legal texts</li>
          <li>Supports PDFs, DOCX, and scanned files</li>
          <li>Secure and confidential file handling</li>
        </ul>
      </section>

      <section className="mb-12 text-center">
        <Image
          src="https://images.unsplash.com/photo-1638006437504-8dd487434d89?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="AI-assisted legal analysis"
          width={800}
          height={400}
          className="mx-auto rounded shadow"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
        <p className="text-lg mb-4">
          Want to see Qurieus in action? Upload a sample NDA or agreement, ask a question like &quot;What are the termination clauses?&quot; and get an instant AI-powered response.
        </p>
        <p className="text-lg mb-4">
          Legal work doesn&apos;t have to be slow or repetitive. Let Qurieus be your intelligent legal assistant.
        </p>
      </section>

      <section className="text-center">
        <TryForFreeButton />
      </section>
    </div>
  </main>
);

export default LawyersPage;