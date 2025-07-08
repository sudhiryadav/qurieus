"use client";

import { showToast } from "@/components/Common/Toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SubscriptionPage from "./subscription/page";
import { showUpgradeToast } from "@/components/Common/UpgradeToast";

export default function UserLayoutContent({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const { data: session } = useSession();
  const { subscriptionPlan, setSubscriptionPlan } = useSubscription();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user) return;
      try {
        const response = await axiosInstance.get("/api/user/subscription");
        setSubscriptionPlan(response.data?.plan ?? null);
        
        // Check for trial expiration and show toast (deduplication handled by toastId)
        if (response.data?.plan?.name === "Free Trial") {
          if (response.data?.status === "active") {
            const trialEnd = new Date(response.data.currentPeriodEnd);
            const now = new Date();
            const diffTime = trialEnd.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Show banner if trial expires in 7 days or less
            if (diffDays <= 7 && diffDays > 0) {
              const getMessage = () => {
                if (diffDays <= 1) {
                  return "Your trial expires tomorrow! Upgrade now to keep your documents and insights.";
                }
                if (diffDays <= 3) {
                  return `Your trial expires in ${diffDays} days. Don't lose access to your documents!`;
                }
                return `Your trial expires in ${diffDays} days. Consider upgrading to continue using Qurieus.`;
              };
              
              showUpgradeToast(getMessage(), diffDays);
            }
          } else if (response.data?.status === "expired") {
            // Show expired toast
            showUpgradeToast("Your trial has expired! Upgrade now to restore access to your documents.", 0);
          }
        }
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

  return (
    <>
      {children}
    </>
  );
} 