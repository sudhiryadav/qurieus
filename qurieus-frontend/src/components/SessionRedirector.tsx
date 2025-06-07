"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SessionRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && session?.user && session.user.hasPassword === false) {
      if (pathname !== "/set-password") {
        router.replace("/set-password");
      }
    }
  }, [status, session, router, pathname]);

  return null;
} 