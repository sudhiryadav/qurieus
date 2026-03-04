"use client";
import React from "react";
import { useState } from "react";
import { showToast } from "@/components/Common/Toast";
import axios from '@/lib/axios';
import Loader from "@/components/Common/Loader";
import Link from "next/link";
import Image from "next/image";
import AuthDotsGrid from "@/components/Auth/AuthDotsGrid";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/forgot-password/reset", {
        email,
      });

      showToast.success("Password reset link sent to your email!");
      setSent(true);
    } catch (error: any) {
      showToast.error(error.response?.data?.error || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div
              className="wow fadeInUp relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-dark-2 sm:px-12 md:px-[60px]"
              data-wow-delay=".15s"
            >
              <div className="mb-10 text-center">
                <Link href="/" className="mx-auto inline-block max-w-[160px]">
                  <div className="relative h-[30px] w-[140px]">
                    <Image
                      src="/images/logo/logo.svg"
                      alt="logo"
                      fill
                      className="dark:hidden"
                      priority
                    />
                    <Image
                      src="/images/logo/logo-white.svg"
                      alt="logo"
                      fill
                      className="hidden dark:block"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {sent ? (
                <div className="space-y-4">
                  <p className="text-base text-body-color dark:text-dark-6">
                    We&apos;ve sent a password reset link to <strong className="text-dark dark:text-white">{email}</strong>. Check your inbox and follow the instructions to reset your password.
                  </p>
                  <p className="text-sm text-body-color dark:text-dark-6">
                    Didn&apos;t receive the email?{" "}
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      Try again
                    </button>
                  </p>
                  <Link
                    href="/signin"
                    className="inline-block w-full rounded-md border border-primary bg-primary px-5 py-3 text-center text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90"
                  >
                    Back to sign in
                  </Link>
                </div>
              ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-[22px]">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark"
                  >
                    Send Email {loading && <Loader />}
                  </button>
                </div>
                <p className="text-center text-sm text-body-color dark:text-dark-6">
                  Remember your password?{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Back to sign in
                  </Link>
                </p>
              </form>
              )}

              <AuthDotsGrid />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
