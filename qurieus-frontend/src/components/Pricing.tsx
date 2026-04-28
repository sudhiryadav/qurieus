"use client";

import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import AuthModal from "@/components/Auth/AuthModal";
import { PaddleCheckout, PaddleCheckoutRef } from "@/components/PaddleCheckout";
import { SubscriptionPlanWithPaddle } from "@/types/subscription";
import { CheckoutEventError, CheckoutEventsData } from "@paddle/paddle-js";
import {
  trackPurchaseConversionFromDirectPayment,
  trackPurchaseConversionFromPaddleCheckout,
  trackPurchaseConversionFromPlan,
} from "@/lib/gtag";
import axios from "@/lib/axios";
import { showToast } from "@/components/Common/Toast";
import { UserSubscription } from "@prisma/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { logger } from "@/lib/logger";

export default function Pricing({
  onUpdatePlan,
  hideFreeTrialWhenExpired,
}: {
  onUpdatePlan?: (subscriptionId: string, priceId: string) => void;
  /** When true, hides Free Trial from the plan list (e.g. when user's trial has expired) */
  hideFreeTrialWhenExpired?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const { data: session } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanWithPaddle | null>(null);
  const paddleRef = useRef<PaddleCheckoutRef>(null);
  const [plans, setPlans] = useState<SubscriptionPlanWithPaddle[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<
    string | null
  >(null);
  const [currentSubscription, setCurrentSubscription] =
    useState<UserSubscription | null>(null);
  const { subscriptionPlan, setSubscriptionPlan } = useSubscription();
  const [overlayLoading, setOverlayLoading] = useState(false);

  function purchaseTypeForZeroPricePlan(
    plan: SubscriptionPlanWithPaddle,
  ): "free_trial" | "free_tier" {
    if (plan.name === "Free Trial") return "free_trial";
    return "free_tier";
  }

  // Simplified plan upgrade logic
  const handlePlanUpgrade = async (plan: SubscriptionPlanWithPaddle) => {
    let resolvedPriceId = plan.paddleConfig?.priceId || "";
    const checkoutAttemptId = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    logger.info("Pricing: Starting paid plan flow", {
      checkoutAttemptId,
      planId: plan.id,
      planName: plan.name,
      hasInlinePaddleConfig: !!plan.paddleConfig,
      hasInitialPriceId: !!resolvedPriceId,
      initialPriceId: resolvedPriceId || null,
      nodeEnv: process.env.NODE_ENV,
      hasClientToken: !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    });

    try {
      if (!resolvedPriceId) {
        try {
          logger.info("Pricing: Resolving Paddle price mapping", {
            checkoutAttemptId,
            planId: plan.id,
            planName: plan.name,
          });
          const resolved = await axios.post("/api/paddle/resolve-price", {
            planId: plan.id,
            checkoutAttemptId,
          });
          resolvedPriceId = resolved.data?.priceId || "";
          logger.info("Pricing: Price mapping resolved", {
            checkoutAttemptId,
            resolvedPriceId: resolvedPriceId || null,
            resolvedProductId: resolved.data?.productId || null,
          });
        } catch (resolveError: any) {
          logger.error("Pricing: Failed to resolve Paddle price", {
            checkoutAttemptId,
            planId: plan.id,
            planName: plan.name,
            error: resolveError?.response?.data || resolveError?.message || String(resolveError),
          });
        }
      }

      if (!resolvedPriceId) {
        logger.error("Pricing: Missing resolved price id after resolution attempts", {
          checkoutAttemptId,
          planId: plan.id,
          planName: plan.name,
        });
        showToast.error(`Paddle price is not mapped for '${plan.name}'. Please sync Paddle IDs.`);
        return;
      }

      // Check if user exists in Paddle and has payment methods
      logger.info("Pricing: Calling check-customer", {
        checkoutAttemptId,
        priceId: resolvedPriceId,
      });
      const customerCheck = await axios.post("/api/paddle/check-customer", {
        priceId: resolvedPriceId,
        checkoutAttemptId,
      });
      
      logger.info("Pricing: check-customer response", {
        checkoutAttemptId,
        hasPaymentMethod: customerCheck.data?.hasPaymentMethod,
        customerId: customerCheck.data?.customerId || null,
        hasExistingSubscription: customerCheck.data?.hasExistingSubscription,
      });
      
      if (customerCheck.data.hasPaymentMethod) {
        // User exists in Paddle, try direct payment
        setOverlayLoading(true);
        
        try {
          logger.info("Pricing: Attempting direct-payment", {
            checkoutAttemptId,
            priceId: resolvedPriceId,
            planId: plan.id,
          });
          const directPayment = await axios.post("/api/paddle/direct-payment", {
            priceId: resolvedPriceId,
            planId: plan.id,
            checkoutAttemptId,
          });
          
          if (directPayment.data.success) {
            logger.info("Pricing: direct-payment succeeded", {
              checkoutAttemptId,
              responseMessage: directPayment.data?.message,
            });
            trackPurchaseConversionFromDirectPayment(
              plan,
              session?.user?.id,
            );
            showToast.success("Payment processed successfully!");
            window.location.reload();
          } else if (directPayment.data.needsCheckout) {
            logger.warn("Pricing: direct-payment requested checkout fallback", {
              checkoutAttemptId,
              responseMessage: directPayment.data?.message,
            });
            // Fallback to checkout
            setTimeout(() => {
              paddleRef.current?.openCheckout(resolvedPriceId, plan.id, checkoutAttemptId);
            }, 100);
          }
        } catch (error) {
          logger.error("Pricing: direct-payment failed, fallback to checkout", {
            checkoutAttemptId,
            error: (error as any)?.response?.data || (error as any)?.message || String(error),
          });
          // Fallback to checkout
          setTimeout(() => {
            paddleRef.current?.openCheckout(resolvedPriceId, plan.id, checkoutAttemptId);
          }, 100);
        } finally {
          setOverlayLoading(false);
        }
      } else {
        logger.info("Pricing: No payment method, opening checkout", {
          checkoutAttemptId,
          priceId: resolvedPriceId,
        });
        // User doesn't exist in Paddle, show checkout
        setTimeout(() => {
          paddleRef.current?.openCheckout(resolvedPriceId, plan.id, checkoutAttemptId);
        }, 100);
      }
    } catch (error) {
      logger.error("Pricing: Paid plan flow outer error, fallback to checkout", {
        checkoutAttemptId,
        error: (error as any)?.response?.data || (error as any)?.message || String(error),
        resolvedPriceId: resolvedPriceId || null,
      });
      // Fallback to checkout
      setTimeout(() => {
        if (resolvedPriceId) {
          paddleRef.current?.openCheckout(resolvedPriceId, plan.id, checkoutAttemptId);
        } else {
          logger.error("Pricing: Cannot fallback to checkout due to missing priceId", {
            checkoutAttemptId,
            planId: plan.id,
            planName: plan.name,
          });
        }
      }, 100);
    }
  };

  useEffect(() => {
    // Get current subscription
    const fetchCurrentSubscription = async () => {
      if(session?.user?.role === "AGENT" || session?.user?.role === "SUPER_ADMIN") return Promise.resolve(null);
      return axios
        .get<UserSubscription>(`/api/user/subscription/${session?.user?.id}`)
        .then((res) => res.data);
    };

    // Get the plans (always fetch so "View Plans" / "Change Plan" shows plans for all roles including SUPER_ADMIN)
    const fetchPlans = async () => {
      return axios
        .get<SubscriptionPlanWithPaddle[]>(
          "/api/subscription/plans",
        )
        .then((res) => res.data);
    };

    const promises: Promise<any>[] = [];

    if (session?.user?.id) {
      promises.push(fetchCurrentSubscription());
    }else{
      promises.push(Promise.resolve(null));
    }
    promises.push(fetchPlans());
    setLoadingPricing(true);
    Promise.all(promises)
        .then(([currentSubscription, plans]) => {
          setCurrentPlanId(currentSubscription?.planId || null);
          setCurrentSubscriptionId(currentSubscription?.paddleSubscriptionId || null);
          setCurrentSubscription(currentSubscription || null);
          setPlans(plans);
        })
        .finally(() => {
          setLoadingPricing(false);
        });
  }, [session]);

  const startSubscriptionProcess = async () => {
    if(subscriptionPlan){
      router.push("/user/subscription");
      return;
    }else{
      // Handle free plans by creating subscription directly
      if (selectedPlan?.name === "Free Trial" || selectedPlan?.price === 0) {
        setOverlayLoading(true);
        try {
          const response = await axios.post("/api/user/trial");
          if (response.data.success) {
            trackPurchaseConversionFromPlan(
              selectedPlan,
              purchaseTypeForZeroPricePlan(selectedPlan),
              session?.user?.id,
            );
            showToast.success("Free plan applied successfully!");
            // Refresh the page to update subscription state
            router.push("/user/knowledge-base");
          }else{
            showToast.error("Failed to apply free plan. Please try again.");
          }
        } catch (error: any) {
          if (error.response?.data?.error === "User already has a subscription") {
            showToast.error("You already have an active subscription");
            router.push("/user/subscription");
          } else {
            showToast.error("Failed to apply free plan. Please try again.");
          }
        } finally {
          setOverlayLoading(false);
        }
        return;
      }
      
      // Handle paid plans with Paddle
      if (selectedPlan && paddleRef.current) {
        await handlePlanUpgrade(selectedPlan);
      } else {
        showToast.error(
          "Paddle configuration is incomplete. Please contact support.",
        );
      }
    }
  };

  const handlePaddleComplete = async (
    data: CheckoutEventsData | undefined,
  ): Promise<void> => {
    logger.info("Pricing: Paddle checkout completion callback", {
      selectedPlanId: selectedPlan?.id || null,
      selectedPlanName: selectedPlan?.name || null,
      payloadKeys: data ? Object.keys(data as any) : [],
    });
    if (data?.totals) {
      trackPurchaseConversionFromPaddleCheckout(data, selectedPlan);
    }
    // Show success message immediately
    showToast.success("Payment processed successfully! Redirecting...");
    
    // Try to extract the subscription ID from possible fields
    const subscriptionId = (data as any)?.subscription_id || (data as any)?.checkout?.id;
    if (subscriptionId) {
      try {
        await axios.post("/api/paddle/sync-subscription", {
          subscriptionId,
        });
      } catch (err) {
        // Don't show error to user since payment was successful
      }
    }
    
    // Redirect immediately after payment completion
    setTimeout(() => {
      router.push("/user/subscription");
    }, 1000);
  };

  const handlePaddleError = (data: CheckoutEventError | undefined) => {
    logger.error("Pricing: Paddle error callback", {
      error: data || null,
      errorMessage: (data as any)?.message || null,
    });
    const rawMessage = (data as any)?.message || "";
    const message = rawMessage.toLowerCase();

    // Let Paddle surface inline field-level validation (e.g. ZIP/postcode required)
    // without duplicating it as a background toast.
    const isInlineValidationError =
      message.includes("required") ||
      message.includes("invalid") ||
      message.includes("postcode") ||
      message.includes("zip") ||
      message.includes("field") ||
      message.includes("checkout could not be completed");

    if (isInlineValidationError) {
      logger.info("Pricing: Suppressing toast for inline Paddle validation error", {
        rawMessage: rawMessage || null,
      });
      return;
    }

    const fallbackMessage =
      rawMessage ||
      "Paddle checkout failed. If you use an ad-blocker/privacy extension, please disable it for localhost and try again.";
    showToast.error(fallbackMessage);
  };
  const handlePaddleFailed = (data: CheckoutEventsData | undefined) => {
    logger.error("Pricing: Paddle failed callback", {
      eventData: data || null,
    });

    const rawFailureMessage =
      (data as any)?.error?.message ||
      (data as any)?.message ||
      (data as any)?.reason ||
      "";
    const failureMessage = rawFailureMessage.toLowerCase();

    const isInlineValidationError =
      failureMessage.includes("required") ||
      failureMessage.includes("invalid") ||
      failureMessage.includes("postcode") ||
      failureMessage.includes("zip") ||
      failureMessage.includes("field") ||
      failureMessage.includes("checkout could not be completed");

    if (isInlineValidationError || !rawFailureMessage) {
      logger.info("Pricing: Suppressing toast for Paddle failed validation-style event", {
        rawFailureMessage: rawFailureMessage || null,
      });
      return;
    }

    showToast.error("An error occurred while processing your request");
  };

  const handleSubscribe = async (plan: SubscriptionPlanWithPaddle) => {
    setLoading(plan.id);
    setSelectedPlan(plan);
    try {
      if (!session) {
        setAuthMode("signin");
        setAuthModalOpen(true);
        return;
      }

      // Handle Free Trial plans differently
      if (plan.name === "Free Trial") {
        setOverlayLoading(true);
        try {
          const response = await axios.post("/api/user/trial");
          if (response.data.success) {
            trackPurchaseConversionFromPlan(
              plan,
              purchaseTypeForZeroPricePlan(plan),
              session?.user?.id,
            );
            showToast.success("Free trial started successfully!");
            // Refresh the page or update state
            window.location.reload();
          }
        } catch (error: any) {
          if (error.response?.data?.error === "User already has a subscription") {
            showToast.error("You already have an active subscription");
          } else {
            showToast.error("Failed to start free trial. Please try again.");
          }
        } finally {
          setOverlayLoading(false);
        }
        return;
      }

      // Handle paid plans with Paddle
      if (paddleRef.current) {
        await handlePlanUpgrade(plan);
        return;
      } else {
        showToast.error(
          "Paddle configuration is incomplete. Please contact support.",
        );
      }
    } catch (error) {
      showToast.error("An error occurred while processing your request");
    } finally {
      setLoading(null);
    }
  };

  // Separate enterprise plan and optionally hide Free Trial for expired users
  const nonEnterprisePlans = plans?.filter(
    (plan) =>
      plan.name.toLowerCase() !== "enterprise" &&
      !(hideFreeTrialWhenExpired && (plan.name === "Free Trial" || plan.price === 0)),
  );
  // const enterprisePlan = plans?.find(
  //   (plan) => plan.name.toLowerCase() === "enterprise",
  // );

  const getButtonText = (plan: SubscriptionPlanWithPaddle) => {
    if (!session) return "Sign in to subscribe";
    if (loading === plan.id) return "Processing...";
    if (plan.id === currentPlanId) return "Subscribed";
    if (currentPlanId) return "Upgrade";
    if (plan.name === "Free Trial") return "Start Free Trial";
    return "Get started today";
  };

  const isButtonDisabled = (plan: SubscriptionPlanWithPaddle) => {
    return loading === plan.id || plan.id === currentPlanId;
  };

  if (loadingPricing) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading pricing...</h1>
          <p className="text-sm text-gray-500">
            Please wait while we load your pricing.
          </p>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="pricing"
      className="bg-gray-1 pb-8 pt-8 dark:bg-dark-2 lg:pb-[70px] lg:pt-16"
    >
      <LoadingOverlay loading={overlayLoading} htmlText="Applying subscription..." position="absolute" />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSuccess={startSubscriptionProcess}
      />
      <PaddleCheckout
        ref={paddleRef}
        mode="overlay"
        onComplete={handlePaddleComplete}
        onError={handlePaddleError}
        onFailed={handlePaddleFailed}
        onUpdatePlan={onUpdatePlan}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {nonEnterprisePlans?.map((plan: SubscriptionPlanWithPaddle) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-200 transition-transform duration-300 hover:scale-105 hover:transform hover:shadow-lg dark:bg-dark-3 dark:ring-dark-3 sm:p-8`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    className={`text-lg font-semibold leading-8 text-gray-900 dark:text-white`}
                  >
                    {plan.name}
                    <span className="ml-4 mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </span>
                  </h3>
                  {plan.name === "Standard" && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {plan.name === "Free Trial" ? (
                      "Free"
                    ) : (
                      <>
                        <span className="pr-1 text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
                          {plan.currency}
                        </span>
                        {plan.price}
                      </>
                    )}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
                    {plan.name === "Free Trial" ? ` for ${plan.description}` : "/ month"}
                  </span>
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300"
                >
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                  {plan.idealFor && (
                    <li className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                      <span>
                        <b>Ideal For:</b> {plan.idealFor}
                      </span>
                    </li>
                  )}
                  {plan.keyLimits && (
                    <li className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                      <span>
                        <b>Key Limits:</b> {plan.keyLimits}
                      </span>
                    </li>
                  )}
                  {typeof plan.maxDocs !== "undefined" &&
                    plan.maxDocs !== null && (
                      <li className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>
                          <b>Max Docs:</b> {plan.maxDocs}
                        </span>
                      </li>
                    )}
                  {typeof plan.maxStorageMB !== "undefined" &&
                    plan.maxStorageMB !== null && (
                      <li className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>
                          <b>Max Storage:</b> {plan.maxStorageMB} MB
                        </span>
                      </li>
                    )}
                  {typeof plan.maxQueriesPerDay !== "undefined" &&
                    plan.maxQueriesPerDay !== null && (
                      <li className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>
                          <b>Max Queries/Day:</b> {plan.maxQueriesPerDay}
                        </span>
                      </li>
                    )}
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isButtonDisabled(plan)}
                className={`mt-8 block w-full rounded-md bg-indigo-50 px-3 py-2 text-center text-sm font-semibold leading-6 text-indigo-600 hover:bg-indigo-100
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-700
                  dark:text-white dark:hover:bg-indigo-600`}
              >
                {getButtonText(plan)}
              </button>
            </div>
          ))}
        </div>
        {/* Enterprise Plan Section - Temporarily Hidden */}
        {/* {enterprisePlan && (
          <div className="mt-16 flex flex-col items-center rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white shadow-lg">
            <h3 className="mb-2 text-2xl font-bold">{enterprisePlan.name}</h3>
            <p className="mb-4 text-lg">
              {enterprisePlan.description ||
                "Custom solutions for large organizations."}
            </p>
            <ul className="mb-6 space-y-2 text-base">
              {enterprisePlan.features.map((feature: string) => (
                <li key={feature} className="flex items-center gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
              {enterprisePlan.idealFor && (
                <li className="flex items-center gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  <span>
                    <b>Ideal For:</b> {enterprisePlan.idealFor}
                  </span>
                </li>
              )}
              {enterprisePlan.keyLimits && (
                <li className="flex items-center gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  <span>
                    <b>Key Limits:</b> {enterprisePlan.keyLimits}
                  </span>
                </li>
              )}
            </ul>
            <button
              onClick={() => router.push("/contact")}
              className="rounded-md bg-white px-6 py-2 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Contact Us
            </button>
          </div>
        )} */}
      </div>
    </section>
  );
}
