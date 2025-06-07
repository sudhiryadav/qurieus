"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setVerificationStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    fetch(`/api/verify-email?token=${token}`)
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          setVerificationStatus("success");
          setMessage("Email verified successfully! You can now sign in.");
        } else {
          setVerificationStatus("error");
          setMessage(data.message || "Error verifying email");
        }
      })
      .catch((error) => {
        setVerificationStatus("error");
        setMessage("Error verifying email. Please try again.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {message}
          </div>
        </div>

        {verificationStatus === "success" && (
          <div className="mt-4 text-center">
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="mt-4 text-center">
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 