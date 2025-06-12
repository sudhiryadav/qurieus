"use client";

import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubscriptionChecked, setIsSubscriptionChecked] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      showToast.error("Please sign in to access this page");
      router.push("/auth/signin");
      return;
    }

    const checkSubscription = async () => {
      try {
        
        const response = await axiosInstance.get("/api/subscription/check");
        const data = response.data;

        if (!data) {
          showToast.error("Please subscribe to a plan to access this page");
          router.push("/pricing");
          return;
        }
        
        setIsSubscriptionChecked(true);
      } catch (error) {
        console.error("Error checking subscription:", error);
        showToast.error("Error checking subscription status. Please try again later.");
        router.push("/pricing");
      }
    };

    if (session?.user) {
      checkSubscription();
    }
  }, [status, router, session]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or subscription not checked
  if (!session?.user || !isSubscriptionChecked) {
    return null;
  }

  // If authenticated and subscription checked, show the layout
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
