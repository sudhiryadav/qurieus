"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [daysBefore, setDaysBefore] = useState("3");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
    if (status !== "authenticated") return;

    if (session?.user?.role !== "SUPER_ADMIN") {
      router.push("/admin/users");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/site-config?key=paid_renewal_reminder_days_before");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load settings");
        setDaysBefore(data?.value || "3");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, session?.user?.role, status]);

  const saveSetting = async () => {
    setSaveState("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "paid_renewal_reminder_days_before",
          value: daysBefore.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save setting");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save setting");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center pt-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.user?.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark dark:text-white">Admin Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configure system-level reminder behavior for subscriptions.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        <h2 className="mb-2 text-lg font-semibold text-dark dark:text-white">
          Paid Renewal Reminder Lead Time
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Choose how many days before paid subscription renewal users should get the first reminder.
          A final reminder is always sent on the renewal day.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="paid-renewal-days"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Days before renewal (1-30)
            </label>
            <input
              id="paid-renewal-days"
              type="number"
              min={1}
              max={30}
              value={daysBefore}
              onChange={(e) => setDaysBefore(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-dark-3 dark:bg-dark-3"
            />
          </div>
          <button
            onClick={saveSetting}
            disabled={saveState === "saving"}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {saveState === "saving" ? "Saving..." : "Save"}
          </button>
        </div>

        {saveState === "saved" && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">
            Setting saved successfully.
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
