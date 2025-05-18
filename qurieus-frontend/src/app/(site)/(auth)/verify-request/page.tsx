import { Metadata } from "next";
import Logo from "@/components/Common/Logo";

export const metadata: Metadata = {
  title: "Check your email | Qurieus - AI-Powered Document Conversations",
  description: "Please check your email for the magic link to sign in.",
};

export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-dark-2">
        <div className="mb-8 text-center">
          <Logo />
        </div>
        <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white">
          Check your email
        </h1>
        <p className="mb-6 text-gray-6 dark:text-gray-4">
          A sign in link has been sent to your email address. Please check your inbox and click the link to sign in.
        </p>
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-6 dark:bg-dark-3 dark:text-gray-4">
          <p>If you don&apos;t see the email, check your spam folder.</p>
        </div>
      </div>
    </div>
  );
} 