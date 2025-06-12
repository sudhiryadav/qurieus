"use client";
import MagicLink from "@/components/Auth/MagicLink";
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
  const [user, setUser] = useState({
    name: "TechProSys User",
    email: "techprosys@gmail.com",
    password: "Sidrules@123",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = user.email;

      if (process.env.NODE_ENV !== "development" && !isBusinessEmail(email)) {
        showToast.error("Please use a business email address");
        setLoading(false);
        return;
      }

      const response = await axios.post("/api/register", user);
      
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
      const response = await axios.post("/api/resend-verification", {
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
        <MagicLink />
      )}

      <p className="text-body-secondary mb-4 text-base">
        By creating an account you are agree with our{" "}
        <Link href="/#" className="text-primary hover:underline">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/#" className="text-primary hover:underline">
          Policy
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
