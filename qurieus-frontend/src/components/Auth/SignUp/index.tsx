"use client";
// MagicLink component hidden for now
import SwitchOption from "@/components/Auth/SwitchOption";
import Loader from "@/components/Common/Loader";
import Logo from "@/components/Common/Logo";
import { showToast } from "@/components/Common/Toast";
import { CountdownTimer } from "@/components/CountdownTimer";
import { OTPInput } from "@/components/OTPInput";
import axios from "@/lib/axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SignUpFormProps {
  onSuccess?: () => void;
  className?: string;
  handleOpenAuthModal?: (mode: "signin" | "signup") => void;
}

export default function SignUp({
  onSuccess,
  className = "",
  handleOpenAuthModal,
}: SignUpFormProps) {
  const router = useRouter();
  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [user, setUser] = useState(process.env.NODE_ENV === "development" ? {
    name: "TechProSys User",
    email: "techprosys@gmail.com",
    password: "Sidrules@123",
  } : {
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = user.email;

      if (process.env.NEXT_PUBLIC_ALLOW_PERSONAL_EMAILS !== "true" && !isBusinessEmail(email)) {
        showToast.error("Please use a business email address");
        setLoading(false);
        return;
      }

      await axios.post("/api/user/signup", user);
      
      // If we get here, either it's a new user or an unverified user
      showToast.success("Verification code sent to your email!");
      setShowVerification(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        // User exists and is verified
        showToast.error("This email is already registered and verified. Please sign in instead.");
        if (handleOpenAuthModal) {
          handleOpenAuthModal("signin");
        } else {
          router.push("/signin");
        }
      } else {
        showToast.error(err.response?.data?.error || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/user/verify-email", {
        email: user.email,
        code: verificationCode,
      });

      showToast.success("Email verified successfully!");
      // Auto-login after verification
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: user.email,
        password: user.password,
      });
      if (signInResult && !signInResult.error) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/user/knowledge-base");
        }
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setResendTimer(60);

    try {
      const response = await axios.post("/api/user/resend-verification", {
        email: user.email
      });

      showToast.success("Verification code resent!");

      // Start countdown timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      showToast.error(err.response?.data?.error || "Failed to resend code");
      setResendDisabled(false);
    }
  };

  if (showVerification) {
    return (
      <div
        className={`mx-auto w-full max-w-[480px] rounded-lg bg-white p-8 dark:bg-dark-2 ${className}`}
      >
        <div className="mb-6">
          <Logo width={40} height={40} showBrandName />
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold text-dark dark:text-white">
          Verify your email
        </h2>
        <p className="mb-8 text-center text-base text-body-color dark:text-dark-6">
          We&apos;ve sent a 4-digit code to {user.email}
        </p>
        <form onSubmit={handleVerification}>
          <OTPInput
            length={4}
            value={verificationCode}
            onChange={setVerificationCode}
            onComplete={() => {
              if (verificationCode.length === 4)
                handleVerification(new Event("submit") as any);
            }}
          />
          <div className="mb-9">
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 4}
              className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verify Email {loading && <Loader />}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendDisabled}
            className="hover:text-primary-dark font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendDisabled ? (
              <CountdownTimer
                seconds={resendTimer}
                onComplete={() => setResendDisabled(false)}
              />
            ) : (
              "Resend code"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-[480px] rounded-lg bg-white p-8 dark:bg-dark-2 ${className}`}
    >
      <div className="mb-6">
        <Logo width={40} height={40} showBrandName />
      </div>
      <h2 className="mb-2 text-center text-3xl font-bold text-dark dark:text-white">
        Create your account
      </h2>
      <p className="mb-8 text-center text-base text-body-color dark:text-dark-6">
        Or{" "}
        {handleOpenAuthModal ? (
          <button
            type="button"
            className="hover:text-primary-dark font-medium text-primary"
            onClick={() => handleOpenAuthModal?.("signin")}
          >
            sign in to your account
          </button>
        ) : (
          <Link
            href="/signin"
            className="hover:text-primary-dark font-medium text-primary"
          >
            sign in to your account
          </Link>
        )}
      </p>
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            signIn("google", {
              callbackUrl: "/user/knowledge-base",
              redirect: true,
            })
          }
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
          Continue with Google
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
          <div className="mb-[22px]">
            <input
              type="text"
              placeholder="Name"
              name="name"
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
          <div className="mb-[22px]">
            <input
              type="email"
              placeholder="Email"
              name="email"
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="mb-[22px]">
            <input
              type="password"
              placeholder="Password"
              name="password"
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              value={user.password}
            />
          </div>
          <div className="mb-9">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sign Up {loading && <Loader />}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center text-gray-500">
          Magic link functionality is currently unavailable.
        </div>
      )}

      <p className="text-body-secondary mb-4 text-base">
        By creating an account you agree to our{" "}
        <Link href="/privacy-policy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms-of-service" className="text-primary hover:underline">
          Terms of Service
        </Link>
      </p>
    </div>
  );
}

// Helper function to check if email is a business email
function isBusinessEmail(email: string): boolean {
  const personalEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "aol.com",
    "icloud.com",
    "mail.com",
    "protonmail.com",
    "zoho.com",
    "yandex.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? !personalEmailDomains.includes(domain) : false;
}
