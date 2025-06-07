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
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-8 text-primary dark:text-primary/90">Privacy Policy</h2>
              <p className="text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">1. Introduction</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Welcome to Qurieus. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our services, and tell you about your privacy rights and how the law protects you.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">2. Information We Collect</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.1 Personal Information</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Contact information (name, email address, phone number)</li>
                        <li>Account credentials and profile information</li>
                        <li>Billing and payment information</li>
                        <li>Company and job title information</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.2 Usage Information</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Log data (IP address, browser type, pages visited)</li>
                        <li>Device information (device type, operating system)</li>
                        <li>Usage patterns and preferences</li>
                        <li>Interaction with our services and features</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.3 Content Information</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Documents and files you upload</li>
                        <li>Conversations and interactions with our AI</li>
                        <li>User-generated content and feedback</li>
                        <li>Workspace and project data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">3. How We Use Your Information</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.1 Primary Purposes</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>To provide, maintain, and improve our services</li>
                        <li>To process your transactions and manage your account</li>
                        <li>To communicate with you about our services</li>
                        <li>To personalize your experience and content</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.2 Secondary Purposes</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>To analyze and improve our services</li>
                        <li>To detect and prevent fraud or abuse</li>
                        <li>To comply with legal obligations</li>
                        <li>To develop new features and services</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">4. Data Security</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We implement appropriate technical and organizational measures to protect your personal data, including:
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                    <li>End-to-end encryption for data in transit and at rest</li>
                    <li>Regular security assessments and audits</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Secure data centers and cloud infrastructure</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">5. Data Sharing and Disclosure</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">5.1 Service Providers</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        We may share your information with trusted third-party service providers who assist us in operating our services, such as:
                      </p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                        <li>Cloud hosting and storage providers</li>
                        <li>Payment processors and billing services</li>
                        <li>Analytics and monitoring services</li>
                        <li>Customer support and communication tools</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">5.2 Legal Requirements</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        We may disclose your information if required by law, court order, or governmental authority, or if we believe such disclosure is necessary to:
                      </p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                        <li>Comply with legal obligations</li>
                        <li>Protect our rights and property</li>
                        <li>Prevent fraud or illegal activity</li>
                        <li>Ensure the safety of our users</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">6. Your Rights and Choices</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You have the following rights regarding your personal data:
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                    <li>Access and view your personal information</li>
                    <li>Correct or update inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to or restrict certain processing</li>
                    <li>Data portability</li>
                    <li>Withdraw consent</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">7. International Data Transfers</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">8. Children&apos;s Privacy</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">9. Changes to This Policy</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">10. Contact Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Email: privacy@qurieus.com<br />
                    Address: FrontSlash, Sector 8, Dwarka, New Delhi 110077<br />
                    Phone: +919953633888
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 