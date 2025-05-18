import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Qurieus - AI-Powered Document Conversations",
  description: "Sign in to your Qurieus account to manage your AI-powered document conversations.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 