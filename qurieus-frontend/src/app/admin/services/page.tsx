"use client";

import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/Common/Toast";
import axios from "@/lib/axios";
import { Activity, CheckCircle2, XCircle, MinusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ServiceStatus = "ok" | "error" | "skipped";

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  message?: string;
  latencyMs?: number;
}

interface HealthResponse {
  services: ServiceCheck[];
  summary: { ok: number; error: number; skipped: number };
  checkedAt: string;
}

export default function AdminServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const { data: res } = await axios.get<HealthResponse>("/api/admin/services/health");
      setData(res);
    } catch (err) {
      showToast.error("Failed to fetch service status");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/user/dashboard");
      return;
    }
    fetchHealth();
  }, [status, session, router, fetchHealth]);

  const StatusIcon = ({ s }: { s: ServiceCheck }) => {
    if (s.status === "ok")
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (s.status === "error")
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    return <MinusCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />;
  };

  const statusLabel = (s: ServiceStatus) =>
    s === "ok" ? "Healthy" : s === "error" ? "Error" : "Skipped";

  if (loading && !data) {
    return <LoadingOverlay loading={true} htmlText="Checking services..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Third-Party Services
          </h1>
          <p className="mt-1 text-sm text-body-color dark:text-dark-6">
            Health status of Paddle, Backend API, Modal, Qdrant, S3, SMTP, and other integrations
          </p>
        </div>
        <Button
          onClick={() => fetchHealth(true)}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Checking..." : "Refresh"}
        </Button>
      </div>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-dark dark:text-white">
                  Healthy
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {data.summary.ok}
              </p>
            </div>
            <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-dark dark:text-white">
                  Errors
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {data.summary.error}
              </p>
            </div>
            <div className="rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2">
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-dark dark:text-white">
                  Skipped
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {data.summary.skipped}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-white dark:border-dark-3 dark:bg-dark-2">
            <div className="border-b border-stroke px-4 py-3 dark:border-dark-3">
              <h2 className="font-semibold text-dark dark:text-white">
                Service Status
              </h2>
              <p className="text-xs text-body-color dark:text-dark-6">
                Last checked: {new Date(data.checkedAt).toLocaleString()}
              </p>
            </div>
            <ul className="divide-y divide-stroke dark:divide-dark-3">
              {data.services.map((s) => (
                <li
                  key={s.name}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon s={s} />
                    <div>
                      <p className="font-medium text-dark dark:text-white">
                        {s.name}
                      </p>
                      <span
                        className={`text-xs font-medium ${
                          s.status === "ok"
                            ? "text-green-600 dark:text-green-400"
                            : s.status === "error"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {statusLabel(s.status)}
                      </span>
                      {s.message && (
                        <p className="mt-1 text-sm text-body-color dark:text-dark-6">
                          {s.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {s.latencyMs != null && s.status === "ok" && (
                    <span className="text-xs text-body-color dark:text-dark-6">
                      {s.latencyMs}ms
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
