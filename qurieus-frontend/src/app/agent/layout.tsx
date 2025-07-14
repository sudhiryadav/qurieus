"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Logo from "@/components/Common/Logo";
import { MessageSquare } from "lucide-react";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "AGENT") {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "AGENT") {
    return null;
  }

  return (
    <main className="flex-1">{children}</main>
  );
} 