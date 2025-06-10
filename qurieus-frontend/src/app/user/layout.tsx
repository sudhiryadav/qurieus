"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
      router.push("/signin");
    }
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/subscription/check");
        const data = await response.json();

        if (!data) {
          toast.error(
            "Please subscribe to a plan to access admin panel",
          );
          router.push("/pricing");
        }
        else{
          setIsSubscriptionChecked(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast.error("Error checking subscription status");
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

  if (!isSubscriptionChecked) {
    return null;
  }

  // If authenticated, show the layout
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
