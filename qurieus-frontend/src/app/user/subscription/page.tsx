"use client";

import Loader from "@/components/Common/Loader";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { showToast } from "@/components/Common/Toast";
import Pricing from "@/components/Pricing";
import FullScreenDialog from "@/components/ui/FullScreenDialog";
import axiosInstance from "@/lib/axios";
import { UserSubscription, SubscriptionPlan } from "@prisma/client";
import { format, differenceInDays } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { CreditCard } from "lucide-react";

const FullScreenPricing = ({
  showPricingModal,
  setShowPricingModal,
  onUpdatePlan,
  hideFreeTrialWhenExpired,
}: {
  showPricingModal: boolean;
  setShowPricingModal: (show: boolean) => void;
  onUpdatePlan: (subscriptionId: string, priceId: string) => void;
  hideFreeTrialWhenExpired?: boolean;
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
      <Pricing onUpdatePlan={onUpdatePlan} hideFreeTrialWhenExpired={hideFreeTrialWhenExpired} />
    </FullScreenDialog>
  );
};

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionAndPlan | null>(
    null,
  );
  interface SubscriptionAndPlan extends UserSubscription {
    plan: SubscriptionPlan;
  }
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<{
    latestRequest: { id: string; status: string; requestedAt: string; rejectionReason?: string } | null;
    hasUsedExtension: boolean;
    canRequestExtension: boolean;
  } | null>(null);
  const [requestingExtension, setRequestingExtension] = useState(false);

  const onUpdatePlan = (subscriptionId: string, priceId: string) => {
    setShowPricingModal(false);
    fetchSubscription(true);
  };

  const fetchSubscription = useCallback(async (force: boolean = false) => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axiosInstance.get("/api/user/subscription");
      setSubscription(response.data as SubscriptionAndPlan);
      if (force) {
        showToast.info(response.data === null ? "No subscription found" : "Subscription details updated");
      }
    } catch (error) {
      showToast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchExtensionStatus = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/user/trial-extension");
      setExtensionStatus(res.data);
    } catch {
      setExtensionStatus(null);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchSubscription(false);
    }
  }, [session, fetchSubscription]);

  useEffect(() => {
    if (session?.user && subscription?.plan?.name === "Free Trial" && subscription?.status === "expired") {
      fetchExtensionStatus();
    }
  }, [session, subscription, fetchExtensionStatus]);

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
            className="ml-2 inline-block rounded-lg px-6 py-3 text-white hover:bg-secondary/90 outline"
          >
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

  const isExpiredTrial = subscription.plan.name === "Free Trial" && subscription.status === "expired";

  return (
    <div>
      {isExpiredTrial && (
        <div className="mb-6 rounded-lg border-2 border-amber-500 bg-amber-50 p-6 dark:border-amber-600 dark:bg-amber-950/30">
          <h3 className="mb-2 text-lg font-semibold text-amber-800 dark:text-amber-200">
            Your free trial has expired
          </h3>
          <p className="mb-4 text-amber-700 dark:text-amber-300">
            You can still view your documents and dashboard, but chat and new queries are disabled. Upgrade to a paid plan to restore full access and continue using Qurieus.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPricingModal(true)}
              className="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              Upgrade to a paid plan
            </button>
            {extensionStatus?.canRequestExtension && (
              <button
                onClick={async () => {
                  setRequestingExtension(true);
                  try {
                    await axiosInstance.post("/api/user/trial-extension");
                    showToast.success("Extension request submitted. An admin will review it shortly.");
                    fetchExtensionStatus();
                  } catch (err: unknown) {
                    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
                    showToast.error(msg || "Failed to submit request");
                  } finally {
                    setRequestingExtension(false);
                  }
                }}
                disabled={requestingExtension}
                className="rounded-lg border-2 border-amber-600 bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-500 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-900/50"
              >
                {requestingExtension ? "Submitting..." : "Request 7-day extension (one-time)"}
              </button>
            )}
            {extensionStatus?.latestRequest?.status === "PENDING" && (
              <span className="flex items-center rounded-lg border border-amber-600 px-4 py-3 text-amber-700 dark:text-amber-200">
                Extension request pending admin approval
              </span>
            )}
            {extensionStatus?.latestRequest?.status === "REJECTED" && (
              <span className="flex items-center rounded-lg border border-red-300 px-4 py-3 text-red-700 dark:text-red-300">
                {extensionStatus.latestRequest.rejectionReason || "Extension request was declined"}
              </span>
            )}
            {extensionStatus?.hasUsedExtension && (
              <span className="flex items-center rounded-lg border border-amber-600 px-4 py-3 text-amber-700 dark:text-amber-200">
                You have already used your one-time extension
              </span>
            )}
          </div>
        </div>
      )}
      <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
      <CreditCard className="h-8 w-8 text-blue-600" />
      <h1 className="text-3xl font-bold">Subscription Details</h1>
      </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPricingModal(true)}
            className="rounded-lg border border-primary bg-white px-6 py-3 text-primary hover:bg-primary hover:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            {isExpiredTrial ? "Upgrade Plan" : "Change Plan"}
          </button>
          <button
            onClick={() => fetchSubscription(true)}
            className="inline-flex items-center rounded-lg px-6 py-3 text-white hover:bg-secondary/90"
            disabled={refreshing}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
      <LoadingOverlay loading={loading} htmlText="Loading subscription details..." position="absolute" />
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Current Plan</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
              <p className="text-lg font-medium">{subscription.plan.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              {/* set color green if active, red if expired/inactive */}
              <p
                className={`text-lg font-medium capitalize ${subscription.status === "active" ? "rounded-md bg-green-500/10 p-2 text-green-500" : "rounded-md bg-red-500/10 p-2 text-red-500"}`}
              >
                {subscription.status === "active"
                  ? "Active"
                  : subscription.status === "expired"
                    ? "Expired"
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
                {subscription.plan.name === "Free Trial"
                  ? "Free"
                  : subscription.paddlePaymentCurrency +
                    " " +
                    (subscription.paddlePaymentAmount
                      ? subscription.paddlePaymentAmount / 100
                      : "-")}
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
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remaining Days
              </p>
              <p className="text-lg font-medium">
              {(() => {
                  const daysLeft = differenceInDays(new Date(subscription.nextBillingDate), new Date());
                  if (daysLeft >= 0) {
                    return <>{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</>;
                  }
                  return (
                    <span className="text-red-500 dark:text-red-400">
                      Expired
                    </span>
                  );
                })()}
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
              <p className="text-lg font-medium">{subscription.plan.maxDocs}</p>
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
        hideFreeTrialWhenExpired={isExpiredTrial}
      />
    </div>
  );
}
