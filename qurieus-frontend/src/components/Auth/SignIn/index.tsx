"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Logo from "@/components/Common/Logo";
import SwitchOption from "@/components/Auth/SwitchOption";
import Loader from "@/components/Common/Loader";
import MagicLink from "@/components/Auth/MagicLink";
import axios from "@/lib/axios";

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
  const callbackUrl = searchParams.get("callbackUrl") || "/user/dashboard";
  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password");
      return;
    }
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        ...loginData,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        if (result.error === "Please verify your email before signing in") {
          setError(
            "Please verify your email before signing in. Check your inbox for the verification link.",
          );
        } else {
          setError(result.error);
        }
      } else if (result) {
        if (onSuccess) {
          onSuccess();
        }
        else if (result.url) {
          router.push(result.url || callbackUrl);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={loginUser}>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
                {error.includes("verify your email") && loginData.email && (
                  <button
                    type="button"
                    className="w-fit text-left text-primary underline"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await axios.post("/api/resend-verification", {
                          email: loginData.email
                        });
                        toast.success(res.data.message);
                      } catch (err: any) {
                        toast.error(err.response?.data?.error || "Failed to resend verification email");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Resend verification email
                  </button>
                )}
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
        <MagicLink />
      )}
    </div>
  );
}
