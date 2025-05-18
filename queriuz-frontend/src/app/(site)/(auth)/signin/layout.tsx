import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Queriuz - AI-Powered Document Conversations",
  description: "Sign in to your Queriuz account to manage your AI-powered document conversations.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 