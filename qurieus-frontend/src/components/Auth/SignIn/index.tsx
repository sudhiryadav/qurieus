"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Common/Logo";
import SwitchOption from "@/components/Auth/SwitchOption";
import Loader from "@/components/Common/Loader";
// MagicLink component hidden for now
import axios from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";

interface SignInFormProps {
  onSuccess?: () => void;
  className?: string;
  handleOpenAuthModal?: (mode: "signin" | "signup") => void;
}

export default function SignIn({
  onSuccess,
  className = "",
  handleOpenAuthModal,
}: SignInFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/user/dashboard";
  const callbackUrl = rawCallback.startsWith("http")
    ? new URL(rawCallback).pathname
    : rawCallback;
  const urlError = searchParams.get("error");
  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Show error from URL when redirect: true fails (e.g. /signin?error=CredentialsSignin)
  useEffect(() => {
    if (urlError) {
      const msg =
        urlError === "CredentialsSignin"
          ? "Invalid email or password."
          : urlError === "OAuthAccountNotLinked"
          ? "Email already used with another provider."
          : "Sign in failed. Please try again.";
      showToast.error(msg);
    }
  }, [urlError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      // Redirect based on user role
      if (session?.user?.role === "AGENT") {
        router.push("/agent/dashboard");
      } else {
        router.push(callbackUrl);
      }
    }
  }, [status, router, callbackUrl, session?.user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use redirect: true so NextAuth sets the session cookie in the redirect response.
      // With redirect: false, the cookie may not persist before client-side router.push (prod/nginx).
      if (onSuccess) {
        const result = await signIn("credentials", {
          redirect: false,
          email: loginData.email,
          password: loginData.password,
        });
        if (result?.error) {
          showToast.error(result.error);
        } else {
          onSuccess();
        }
      } else {
        await signIn("credentials", {
          redirect: true,
          callbackUrl,
          email: loginData.email,
          password: loginData.password,
        });
        // On error, NextAuth redirects to /signin?error=... - we show it via URL
      }
    } catch (error: any) {
      showToast.error(error.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Magic link functionality hidden for now

  if (status === "authenticated") {
    return null;
  }

  return (
    <div
      className={`mx-auto w-full max-w-[480px] rounded-lg bg-white p-8 dark:bg-dark-2 ${className}`}
    >
      <div className="mb-6">
        <Logo width={40} height={40} showBrandName />
      </div>
      <h2 className="mb-2 text-center text-3xl font-bold text-dark dark:text-white">
        Sign in to your account
      </h2>
      <p className="mb-8 text-center text-base text-body-color dark:text-dark-6">
        Or{" "}
        {handleOpenAuthModal ? (
          <button
            type="button"
            className="hover:text-primary-dark font-medium text-primary"
            onClick={() => handleOpenAuthModal?.("signup")}
          >
            create a new account
          </button>
        ) : (
          <Link
            href="/signup"
            className="hover:text-primary-dark font-medium text-primary"
          >
            create a new account
          </Link>
        )}
      </p>
      <SwitchOption isPassword={isPassword} setIsPassword={setIsPassword} />
      {isPassword ? (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
                {/* Magic link resend functionality hidden for now */}
              </div>
            </div>
          )}
          <div className="mb-[22px]">
            <input
              type="email"
              placeholder="Email"
              required
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="mb-[22px]">
            <input
              type="password"
              placeholder="Password"
              required
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="mb-9">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Sign In {loading && <Loader />}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center text-gray-500">
          Magic link functionality is currently unavailable.
        </div>
      )}
    </div>
  );
}
