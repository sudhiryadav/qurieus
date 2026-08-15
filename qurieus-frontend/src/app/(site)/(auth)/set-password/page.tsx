"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PasswordForm from "@/components/Auth/PasswordForm";
import axios from "@/lib/axios";

function getPostAuthPath(role?: string, wasFirstPassword?: boolean) {
  if (role === "AGENT") return "/agent/dashboard";
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/users";
  if (wasFirstPassword) return "/user/knowledge-base";
  return "/user/dashboard";
}

export default function SetPasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const canSkipPasswordSetup =
    Boolean(session?.user?.hasPassword) || Boolean(session?.user?.hasOAuthAccount);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/signin");
      return;
    }
    if (canSkipPasswordSetup) {
      router.replace(getPostAuthPath(session.user.role));
    }
  }, [session, status, router, canSkipPasswordSetup]);

  const handleSetPassword = async (password: string) => {
    const { data } = await axios.post("/api/user/set-password", { password });
    // Re-fetch session so hasPassword is true before navigating away
    await update();
    router.refresh();
    router.replace(getPostAuthPath(session?.user?.role, data.wasFirstPassword));
  };

  if (status === "loading" || !session || canSkipPasswordSetup) {
    return null;
  }

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
