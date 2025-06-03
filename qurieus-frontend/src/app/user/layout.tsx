"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If authenticated, show the layout
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="container mx-auto px-4 py-8 pt-24">
          {children}
        </div>
      </div>
    </div>
  );
} 