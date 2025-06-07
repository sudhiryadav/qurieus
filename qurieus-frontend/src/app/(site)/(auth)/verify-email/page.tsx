"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;
    fetch(`/api/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.message === "Email verified successfully") {
          setStatus("success");
          toast.success("Your email has been verified!");
          setEmail(data.email);
          signIn("credentials", {
            redirect: false,
            email: data.email,
            password: "temp_password_for_verification"
          }).then((res) => {
            if (res?.ok) {
              router.push("/user/knowledge-base");
            } else {
              toast.error("Error signing in after verification");
              router.push("/signin");
            }
          });
        } else if (res.ok && data.message === "Email already verified") {
          setStatus("already");
          setMessage("Your email is already verified.");
          setEmail(data.email);
        } else {
          setStatus("error");
          setMessage(data || "Invalid or expired verification token.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error verifying email.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-dark-2 p-8 shadow-lg mx-auto text-center">
        <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white">Email Verification</h2>
        {status === "loading" && <p className="text-base text-body-color dark:text-dark-6">Verifying...</p>}
        {status === "success" && <p className="text-green-600 dark:text-green-400">{message}</p>}
        {status === "already" && <p className="text-blue-600 dark:text-blue-400">{message}</p>}
        {status === "error" && <p className="text-red-600 dark:text-red-400">{message}</p>}
      </div>
    </div>
  );
} 