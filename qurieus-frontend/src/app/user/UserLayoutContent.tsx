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
      if (!session?.user || session?.user?.role === "AGENT") return;
      try {
        const response = await axiosInstance.get("/api/user/subscription");
        setSubscriptionPlan(response.data?.plan ?? null);
        
        // Check for trial expiration and show toast (with daily limit)
        if (response.data?.plan?.name === "Free Trial") {
          if (response.data?.status === "active") {
            const trialEnd = new Date(response.data.currentPeriodEnd);
            const now = new Date();
            const diffTime = trialEnd.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Show banner if trial expires in 7 days or less
            if (diffDays <= 7 && diffDays > 0) {
              // Check if we've already shown the toast today
              const today = new Date().toDateString();
              const lastShownDate = localStorage.getItem('trial-toast-last-shown');
              const lastShownDays = localStorage.getItem('trial-toast-last-days');
              
              // Show toast only if:
              // 1. We haven't shown it today, OR
              // 2. The days remaining has changed (e.g., from 3 days to 1 day)
              if (lastShownDate !== today || lastShownDays !== diffDays.toString()) {
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
                
                // Store that we've shown the toast today
                localStorage.setItem('trial-toast-last-shown', today);
                localStorage.setItem('trial-toast-last-days', diffDays.toString());
              }
            }
          } else if (response.data?.status === "expired") {
            // For expired trials, show toast only once per day
            const today = new Date().toDateString();
            const lastShownDate = localStorage.getItem('trial-expired-toast-last-shown');
            
            if (lastShownDate !== today) {
              showUpgradeToast("Your trial has expired! Upgrade now to restore access to your documents.", 0);
              localStorage.setItem('trial-expired-toast-last-shown', today);
            }
          }
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        showToast.error("Error checking subscription status.");
      }
    };
    checkSubscription();
  }, [session, setSubscriptionPlan]);

  // Skip subscription check for admins and agents
  const isAgent = session?.user?.role === "AGENT";
  if (!subscriptionPlan && !isAdmin && !isAgent) {
    return <SubscriptionPage />;
  }

  return (
    <>
      {children}
    </>
  );
} 