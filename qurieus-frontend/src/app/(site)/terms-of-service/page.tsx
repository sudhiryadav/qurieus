import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Qurieus - AI-Powered Document Conversations",
  description: "Read our terms of service for using Qurieus.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Breadcrumb
        pageName="Terms of Service"
        pageDescription="Read our terms of service"
      />
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="prose prose-lg max-w-none dark:prose-invert bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-lg p-8">
            <h2>Terms of Service</h2>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing or using Qurieus, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
            <h3>2. Use of Service</h3>
            <ul>
              <li>You must be at least 18 years old to use Qurieus.</li>
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>You agree not to misuse the service or attempt to access it using a method other than the interface provided.</li>
            </ul>
            <h3>3. User Content</h3>
            <p>
              You retain ownership of any documents or content you upload. By uploading, you grant Qurieus a license to use, store, and process your content as needed to provide the service.
            </p>
            <h3>4. Prohibited Activities</h3>
            <ul>
              <li>Uploading unlawful, harmful, or offensive content</li>
              <li>Attempting to disrupt or compromise the service</li>
              <li>Reverse engineering or copying the platform</li>
            </ul>
            <h3>5. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms or misuse the service.
            </p>
            <h3>6. Changes to Terms</h3>
            <p>
              Qurieus may update these Terms of Service from time to time. We will notify you of any significant changes.
            </p>
            <h3>7. Contact Us</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: support@qurieus.com
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 