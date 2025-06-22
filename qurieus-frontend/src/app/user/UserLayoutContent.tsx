"use client";

import { showToast } from "@/components/Common/Toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SubscriptionPage from "./subscription/page";
import { useRouter } from "next/navigation";

export default function UserLayoutContent({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const { data: session } = useSession();
  const { subscriptionPlan, setSubscriptionPlan } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user) return;
      try {
        const response = await axiosInstance.get("/api/user/subscription");
        setSubscriptionPlan(response.data?.plan ?? null);
      } catch (error) {
        console.error("Error checking subscription:", error);
        showToast.error("Error checking subscription status.");
      }
    };
    checkSubscription();
  }, [session, setSubscriptionPlan]);

  if (!subscriptionPlan && !isAdmin) {
    return <SubscriptionPage />;
  }

  return <>{children}</>;
} 