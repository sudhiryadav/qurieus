"use client";

import { showToast } from "@/components/Common/Toast";
import Pricing from "@/components/Pricing";
import FullScreenDialog from "@/components/ui/FullScreenDialog";
import axiosInstance from "@/lib/axios";
import { Subscription, SubscriptionPlan } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

const FullScreenPricing = ({
  showPricingModal,
  setShowPricingModal,
  onUpdatePlan,
}: {
  showPricingModal: boolean;
  setShowPricingModal: (show: boolean) => void;
  onUpdatePlan: (subscriptionId: string, priceId: string) => void;
}) => {
  return (
    <FullScreenDialog
      isOpen={showPricingModal}
      onClose={() => setShowPricingModal(false)}
      header={<h2 className="text-2xl font-bold">Change Plan</h2>}
      footer={
        <button
          onClick={() => setShowPricingModal(false)}
          className="rounded-lg border border-primary bg-white px-6 py-3 text-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      }
    >
      <Pricing onUpdatePlan={onUpdatePlan} />
    </FullScreenDialog>
  );
};

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionAndPlan | null>(
    null,
  );
  interface SubscriptionAndPlan extends Subscription {
    plan: SubscriptionPlan;
  }
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onUpdatePlan = (subscriptionId: string, priceId: string) => {
    setShowPricingModal(false);
    fetchSubscription(true);
  };

  const fetchSubscription = async (force: boolean = false) => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get("/api/user/subscription");
      setSubscription(response.data as SubscriptionAndPlan);
      if (force) {
        showToast.success("Subscription details updated");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      showToast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSubscription(false);
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
            You don&apos;t have an active subscription. Please subscribe to a
            plan to access our services.
          </p>
          <button
            className="inline-block rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90"
            onClick={() => {
              setShowPricingModal(true);
            }}
          >
            View Plans
          </button>
          <button
            onClick={() => fetchSubscription(true)}
            className="ml-2 inline-block rounded-lg px-6 py-3 text-white hover:bg-secondary/90"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Reload
          </button>
        </div>
        <FullScreenPricing
          showPricingModal={showPricingModal}
          setShowPricingModal={setShowPricingModal}
          onUpdatePlan={onUpdatePlan}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="mb-4 text-3xl font-bold">Subscription Details</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPricingModal(true)}
            className="rounded-lg border border-primary bg-white px-6 py-3 text-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            Change Plan
          </button>
          <button
            onClick={() => fetchSubscription(true)}
            className="inline-flex items-center rounded-lg px-6 py-3 text-white hover:bg-secondary/90"
            disabled={refreshing}
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

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
              {/* set color green if active, red if inactive and show it with background color and padding */}
              <p
                className={`text-lg font-medium capitalize ${subscription.status === "active" ? "rounded-md bg-green-500/10 p-2 text-green-500" : "rounded-md bg-red-500/10 p-2 text-red-500"}`}
              >
                {subscription.status === "active"
                  ? "Active"
                  : "Inactive (Processing)"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Billing Cycle
              </p>
              <p className="text-lg font-medium capitalize">
                {subscription.billingCycle}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
              <p className="text-lg font-medium">
                {subscription.paddlePaymentCurrency}{" "}
                {subscription.paddlePaymentAmount
                  ? subscription.paddlePaymentAmount / 100
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Billing Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start Date
              </p>
              <p className="text-lg font-medium">
                {format(new Date(subscription.startDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next Billing Date
              </p>
              <p className="text-lg font-medium">
                {format(new Date(subscription.nextBillingDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Period
              </p>
              <p className="text-lg font-medium">
                {format(new Date(subscription.currentPeriodStart), "PPP")} -{" "}
                {format(new Date(subscription.currentPeriodEnd), "PPP")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Features</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ideal For
              </p>
              <p className="text-lg font-medium">
                {subscription.plan.idealFor}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No of Documents
              </p>
              <p className="text-lg font-medium">
                {subscription.plan.maxDocs}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Storage
              </p>
              <p className="text-lg font-medium">
                {subscription.plan.maxStorageMB} MB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Queries Per Day
              </p>
              <p className="text-lg font-medium">
                {subscription.plan.maxQueriesPerDay}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FullScreenPricing
        showPricingModal={showPricingModal}
        onUpdatePlan={onUpdatePlan}
        setShowPricingModal={setShowPricingModal}
      />
    </div>
  );
}
