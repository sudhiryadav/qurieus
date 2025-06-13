"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { showToast } from "@/components/Common/Toast";
import { Subscription, SubscriptionPlan } from "@prisma/client";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionAndPlan | null>(null);
  interface SubscriptionAndPlan extends Subscription {
    plan: SubscriptionPlan;
  }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axiosInstance.get("/api/subscription");
        setSubscription(response.data as SubscriptionAndPlan);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        showToast.error("Failed to load subscription details");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">No Active Subscription</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You don&apos;t have an active subscription. Please subscribe to a plan to access our services.
          </p>
          <a
            href="/pricing"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90"
          >
            View Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Subscription Details</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Current Plan</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
              <p className="text-lg font-medium">{subscription.plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-lg font-medium capitalize">{subscription.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Billing Cycle</p>
              <p className="text-lg font-medium capitalize">{subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
              <p className="text-lg font-medium">
                {subscription.paddlePaymentCurrency} {subscription.paddlePaymentAmount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Billing Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
              <p className="text-lg font-medium">
                {format(new Date(subscription.startDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</p>
              <p className="text-lg font-medium">
                {format(new Date(subscription.nextBillingDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Period</p>
              <p className="text-lg font-medium">
                {format(new Date(subscription.currentPeriodStart), "PPP")} -{" "}
                {format(new Date(subscription.currentPeriodEnd), "PPP")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <a
          href="/pricing"
          className="rounded-lg border border-primary bg-white px-6 py-3 text-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          Change Plan
        </a>
      </div>
    </div>
  );
}
