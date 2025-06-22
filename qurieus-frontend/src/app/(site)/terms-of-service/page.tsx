import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Qurieus - AI-Powered Document Conversations",
  description: "Read our terms of service to understand the rules and guidelines for using Qurieus.",
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
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-8 text-primary dark:text-primary/90">Terms of Service</h2>
              <p className="text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">1. Agreement to Terms</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    By accessing or using Qurieus, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">2. Use License</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.1 Permitted Use</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Access and use the service for personal or business purposes</li>
                        <li>Upload and process documents within your subscription limits</li>
                        <li>Use AI-powered features for document analysis and search</li>
                        <li>Share access with authorized team members</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.2 Prohibited Use</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Upload malicious content or software</li>
                        <li>Attempt to reverse engineer the service</li>
                        <li>Share access credentials with unauthorized users</li>
                        <li>Use the service for any illegal or unauthorized purpose</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">3. User Accounts</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.1 Account Creation</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>You must provide accurate and complete information</li>
                        <li>You are responsible for maintaining account security</li>
                        <li>You must be at least 18 years old to create an account</li>
                        <li>One account per individual or organization</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.2 Account Security</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Keep your password secure and confidential</li>
                        <li>Notify us immediately of any security breaches</li>
                        <li>Use strong authentication methods when available</li>
                        <li>Regularly update your security settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">4. Subscription and Payments</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">4.1 Subscription Terms</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Subscriptions are billed in advance</li>
                        <li>Automatic renewal unless cancelled</li>
                        <li>Prices may change with notice</li>
                        <li>Refunds subject to our refund policy</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">4.2 Payment Terms</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Valid payment method required</li>
                        <li>Automatic billing on renewal date</li>
                        <li>Failed payments may result in service suspension</li>
                        <li>All fees are non-refundable unless specified</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">5. Content and Data</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">5.1 User Content</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>You retain ownership of your content</li>
                        <li>You grant us license to process and store your content</li>
                        <li>You are responsible for content compliance</li>
                        <li>We may remove content that violates our terms</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">5.2 Data Processing</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>We process data according to our Privacy Policy</li>
                        <li>We implement security measures to protect data</li>
                        <li>We may use anonymized data for service improvement</li>
                        <li>You can request data deletion as per our policy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">6. Intellectual Property</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">6.1 Service Ownership</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Qurieus and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">6.2 User Rights</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        You retain all rights to your content. By using our service, you grant us a limited license to use, store, and process your content for the purpose of providing and improving our services.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">7. Limitation of Liability</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    To the maximum extent permitted by law, Qurieus shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">8. Termination</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">8.1 Termination by User</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        You may terminate your account at any time by following the cancellation process in your account settings. Upon termination, your access to the service will end at the conclusion of your current billing period.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">8.2 Termination by Us</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">9. Changes to Terms</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Your continued use of the service after such modifications constitutes your acceptance of the new terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">10. Contact Information</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}<br />
                    Address: {process.env.NEXT_PUBLIC_SUPPORT_ADDRESS}<br />
                    Phone: {process.env.NEXT_PUBLIC_SUPPORT_PHONE}
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