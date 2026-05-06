import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice | Qurieus - AI-Powered Document Conversations",
  description: "Important legal information about Qurieus and its services.",
};

export default function LegalNoticePage() {
  return (
    <>
      <Breadcrumb
        pageName="Legal Notice"
        pageDescription="Important legal information"
        showBackButton
      />
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h2>Legal Notice</h2>
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h3>1. Company Information</h3>
            <p>
              Qurieus is operated by:
              <br />
              Frontslash
              <br />
              Bagdola
              <br />
              Sector 8 Dwarka
              <br />
              New Delhi
            </p>

            {/* <h3>2. Contact Information</h3>
            <p>
              For any legal inquiries, please contact:
              <br />
              Email: legal@qurieus.com
              <br />
              Phone: +1 (555) 123-4567
            </p> */}

            {/* <h3>3. Registration</h3>
            <p>
              Company Registration Number: 123456789
              <br />
              VAT Number: US123456789
            </p> */}

            <h3>4. Regulatory Information</h3>
            <p>
              Qurieus complies with:
            </p>
            <ul>
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>Industry-specific regulations</li>
            </ul>
            <p>
              For details on how we collect and use data, see our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. For terms governing use of our services, see our <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>.
            </p>

            <h3>5. Intellectual Property</h3>
            <p>
              All content on this website, including but not limited to text, graphics, logos, and software, is the property of Qurieus and is protected by international copyright laws.
            </p>

            <h3>6. Dispute Resolution</h3>
            <p>
              Any disputes arising from the use of our services shall be resolved through arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h3>7. Governing Law</h3>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 