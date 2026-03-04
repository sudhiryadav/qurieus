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
        showBackButton
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
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.3 Document and AI Content</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Documents and files you upload (PDFs, text, spreadsheets)</li>
                        <li>Conversations and queries with our AI-powered chat interface</li>
                        <li>Document embeddings and processed content for search and retrieval</li>
                        <li>User-generated content, knowledge bases, and workspace data</li>
                        <li>Chat transcripts and conversation history</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.4 Cookies and Similar Technologies</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Essential cookies for authentication and session management</li>
                        <li>Preference cookies for language and display settings</li>
                        <li>Analytics cookies to understand product usage</li>
                        <li>Performance cookies for load balancing and error tracking</li>
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
                        <li>To provide AI-powered document search, chat, and conversation features</li>
                        <li>To process, index, and analyze your documents for intelligent retrieval</li>
                        <li>To manage your account, subscriptions, and billing</li>
                        <li>To communicate with you about service updates and support</li>
                        <li>To personalize your experience and improve AI response quality</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.2 AI and Machine Learning</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Qurieus uses AI and machine learning to power document understanding and conversational search. Your document content is processed to:
                      </p>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Generate embeddings for semantic search within your knowledge base</li>
                        <li>Enable natural language queries and AI-powered answers</li>
                        <li>Improve model accuracy (we do not use your content to train general-purpose models without consent)</li>
                        <li>Detect and prevent abuse or policy violations</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.3 Other Purposes</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>To analyze and improve our SaaS platform</li>
                        <li>To comply with legal obligations</li>
                        <li>To develop new AI features and integrations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">4. Data Security</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    As a SaaS provider handling sensitive documents, we implement industry-standard security measures including:
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                    <li>Encryption in transit (TLS) and at rest (AES) for all document and user data</li>
                    <li>Role-based access controls and multi-factor authentication options</li>
                    <li>Secure cloud infrastructure with SOC 2 compliant providers</li>
                    <li>Regular security assessments, penetration testing, and audits</li>
                    <li>Data isolation between customer workspaces</li>
                    <li>Automated backups and disaster recovery procedures</li>
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
                        <li>Cloud hosting and AI/ML infrastructure providers</li>
                        <li>Payment processors (e.g., Paddle) for subscription billing</li>
                        <li>Email delivery and transactional notification services</li>
                        <li>Analytics and error monitoring (anonymized usage data only)</li>
                        <li>Customer support and help desk tools</li>
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
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">6. Data Retention</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We retain your data for as long as your account is active or as needed to provide our services. Document content, chat history, and embeddings are retained until you delete them or close your account. Upon account deletion, we remove your data within 30 days, except where retention is required by law.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">7. Your Rights and Choices</h3>
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
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">8. International Data Transfers</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">9. Children&apos;s Privacy</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">10. Changes to This Policy</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">11. Contact Us</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "privacy@qurieus.com"}<br />
                    Address: {process.env.NEXT_PUBLIC_SUPPORT_ADDRESS || "FrontSlash, New Delhi"}<br />
                    Phone: {process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 9953633888"}
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