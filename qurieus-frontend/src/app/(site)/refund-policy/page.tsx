import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Qurieus - AI-Powered Document Conversations",
  description: "Learn about our refund policy and how we handle subscription cancellations.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Breadcrumb
        pageName="Refund Policy"
        pageDescription="Learn about our refund policy"
      />
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="prose prose-lg max-w-none dark:prose-invert bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-lg p-8">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-8 text-primary dark:text-primary/90">Refund Policy</h2>
              <p className="text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">1. Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This Refund Policy outlines the terms and conditions for refunds and cancellations of Qurieus subscriptions and services. We strive to ensure customer satisfaction while maintaining fair business practices.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">2. Subscription Cancellation</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.1 Cancellation Process</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>You may cancel your subscription at any time through your account settings</li>
                        <li>Cancellation will take effect at the end of your current billing period</li>
                        <li>You will continue to have access to the service until the end of your paid period</li>
                        <li>No refunds will be provided for partial months of service</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">2.2 Annual Subscriptions</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Annual subscriptions can be cancelled at any time</li>
                        <li>Refunds for annual subscriptions are prorated based on unused months</li>
                        <li>A processing fee may apply to annual subscription refunds</li>
                        <li>Refund requests must be made within 30 days of payment</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">3. Refund Eligibility</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.1 Qualifying Circumstances</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Technical issues preventing service usage for more than 24 hours</li>
                        <li>Billing errors or duplicate charges</li>
                        <li>Service unavailability for extended periods</li>
                        <li>Significant changes to service terms or features</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">3.2 Non-Qualifying Circumstances</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Usage of service during the billing period</li>
                        <li>Change of mind after subscription purchase</li>
                        <li>Failure to use the service</li>
                        <li>Non-technical issues or user errors</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">4. Refund Process</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">4.1 Request Submission</h4>
                      <ol className="space-y-2 text-gray-600 dark:text-gray-400 list-decimal pl-5">
                        <li>Contact our support team at support@qurieus.com</li>
                        <li>Provide your account details and reason for refund</li>
                        <li>Include any relevant documentation or evidence</li>
                        <li>Specify your preferred refund method</li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">4.2 Processing Timeline</h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Refund requests are reviewed within 2-3 business days</li>
                        <li>Approved refunds are processed within 5-10 business days</li>
                        <li>Refunds are issued to the original payment method</li>
                        <li>Processing times may vary based on payment provider</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">5. Special Cases</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">5.1 Enterprise Customers</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enterprise customers with custom agreements may have different refund terms as specified in their contract. Please refer to your enterprise agreement for specific details.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 mt-8">5.2 Promotional Offers</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Special promotional offers and discounted subscriptions may have different refund terms. These terms will be clearly stated at the time of purchase.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">6. Contact Information</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    For any questions regarding our refund policy or to request a refund, please contact us at:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Email: support@qurieus.com<br />
                    Address: FrontSlash, Sector 8, Dwarka, New Delhi 110077<br />
                    Phone: +919953633888
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 text-primary dark:text-primary/90 border-b border-gray-200 dark:border-gray-700 pb-2">7. Policy Updates</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting to our website. We encourage you to review this policy periodically.
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