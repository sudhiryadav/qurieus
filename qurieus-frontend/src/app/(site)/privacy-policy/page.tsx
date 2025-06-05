import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Qurieus - AI-Powered Document Conversations",
  description: "Read our privacy policy to understand how we handle your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumb
        pageName="Privacy Policy"
        pageDescription="Read our privacy policy"
      />
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="prose prose-lg max-w-none dark:prose-invert bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-lg p-8">
            <h2>Privacy Policy</h2>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h3>1. Introduction</h3>
            <p>
              Qurieus is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
            <h3>2. Information We Collect</h3>
            <ul>
              <li>Personal information (name, email, etc.)</li>
              <li>Account and subscription details</li>
              <li>Uploaded documents and content</li>
              <li>Usage and analytics data</li>
            </ul>
            <h3>3. How We Use Your Information</h3>
            <ul>
              <li>To provide and improve our services</li>
              <li>To communicate with you about your account</li>
              <li>To ensure security and prevent misuse</li>
              <li>To comply with legal obligations</li>
            </ul>
            <h3>4. Data Security</h3>
            <p>
              We use industry-standard security measures to protect your data, including encryption, secure authentication, and access controls.
            </p>
            <h3>5. Data Sharing</h3>
            <p>
              We do not sell or rent your personal information. We may share data with trusted service providers as necessary to operate Qurieus, or as required by law.
            </p>
            <h3>6. Your Rights</h3>
            <ul>
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
            <h3>7. Changes to This Policy</h3>
            <p>
              Qurieus may update this Privacy Policy from time to time. We will notify you of any significant changes.
            </p>
            <h3>8. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: support@qurieus.com
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 