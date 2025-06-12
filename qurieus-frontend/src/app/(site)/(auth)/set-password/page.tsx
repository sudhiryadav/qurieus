"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import PasswordForm from "@/components/Auth/PasswordForm";
import axios from "@/lib/axios";

export default function SetPasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/signin");
      return;
    }
    // If user already has a password, redirect to dashboard
    if ((session.user as any)?.hasPassword) {
      router.replace("/user/dashboard");
    }
  }, [session, status, router]);

  const handleSetPassword = async (password: string) => {
    try {
      const { data } = await axios.post("/api/user/set-password", { password });
      toast.success("Password set successfully!");
      // Refresh session by signing in with new credentials
      await signIn("credentials", {
        redirect: false,
        email: session?.user?.email,
        password,
      });
      setTimeout(() => {
        if (data.wasFirstPassword) {
          router.replace("/user/knowledge-base");
        } else {
          router.replace("/user/dashboard");
        }
      }, 1000);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to set password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Set Your Password
          </h2>
        </div>
        <PasswordForm
          onSubmit={handleSetPassword}
          submitButtonText="Set Password"
          requireCurrentPassword={false}
        />
      </div>
    </div>
  );
} 