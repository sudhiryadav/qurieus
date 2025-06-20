"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import axiosInstance from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";
import SubscriptionPage from "./subscription/page";
import { SubscriptionPlan } from "@prisma/client";

export default function UserLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { subscriptionPlan, setSubscriptionPlan } = useSubscription();

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

  if (!subscriptionPlan) {
    return <SubscriptionPage />;
  }

  return <>{children}</>;
} 