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
import { GA_OAUTH_PENDING_KEY, trackGaEvent } from "@/lib/gtag";

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
          ? "This email is linked to a different sign-in method. Please sign in with the same method you used originally (e.g. Google or email/password)."
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
          trackGaEvent("login", { method: "credentials" });
          onSuccess();
        }
      } else {
        const result = await signIn("credentials", {
          redirect: false,
          callbackUrl,
          email: loginData.email,
          password: loginData.password,
        });
        if (result?.error) {
          showToast.error(result.error);
        } else {
          trackGaEvent("login", { method: "credentials" });
          // router.refresh() forces Next.js to re-fetch with the new session cookie
          router.refresh();
          router.push(callbackUrl);
        }
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
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(
              GA_OAUTH_PENDING_KEY,
              JSON.stringify({ intent: "login", provider: "google" })
            );
            signIn("google", {
              callbackUrl,
              redirect: true,
            });
          }}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-stroke bg-white px-5 py-3 text-base font-medium text-dark transition hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-stroke dark:bg-dark-3" />
        <span className="text-sm text-body-color dark:text-dark-6">Or</span>
        <div className="h-px flex-1 bg-stroke dark:bg-dark-3" />
      </div>
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
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
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
