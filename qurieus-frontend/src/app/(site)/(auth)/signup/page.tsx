import SignUp from "@/components/Auth/SignUp";
import Logo from "@/components/Common/Logo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Qurieus - AI-Powered Document Conversations",
  description: "Create your Qurieus account to start transforming your documents into interactive conversations.",
};

const SignupPage = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <SignUp />
    </section>
  );
};

export default SignupPage;
