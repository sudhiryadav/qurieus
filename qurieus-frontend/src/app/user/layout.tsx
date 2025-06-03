"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserNav from "@/components/UserNav";
import Header from "@/components/Header";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Header with sidebar toggle on mobile */}
      <div className="relative z-40">
        <div className="flex items-center w-full">
          {/* Sidebar toggle button (mobile only) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="block lg:hidden ml-2 mr-2 p-2 rounded focus:outline-none mr-2"
            aria-label="Open sidebar"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Brand logo */}
          <div className="flex-shrink-0 ml-2">
            <Header />
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <UserNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="container mx-auto px-4 py-8 pt-24">
          {children}
        </div>
      </div>
    </div>
  );
} 