import SignUp from "@/components/Auth/SignUp";
import AuthDotsGrid from "@/components/Auth/AuthDotsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Qurieus - AI-Powered Document Conversations",
  description: "Create your Qurieus account to start transforming your documents into interactive conversations.",
};

const SignupPage = () => {
  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20 min-h-screen flex items-center">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div
              className="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white px-8 py-14 dark:bg-dark-2 sm:px-12 md:px-[60px]"
            >
              <AuthDotsGrid />
              <SignUp />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
