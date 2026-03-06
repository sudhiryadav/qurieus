"use client";

import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { Clock, Check, X, UserPlus, Search } from "lucide-react";

interface TrialExtensionRequest {
  id: string;
  userId: string;
  status: string;
  requestedAt: string;
  extensionDays: number;
  newPeriodEnd: string | null;
  rejectionReason: string | null;
  user: { id: string; name: string; email: string };
}

export default function AdminTrialExtensionsPage() {
  const [requests, setRequests] = useState<TrialExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [approveDays, setApproveDays] = useState<Record<string, number>>({});
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  // Direct extend section
  const [directUserId, setDirectUserId] = useState("");
  const [directExtendDays, setDirectExtendDays] = useState(7);
  const [directEndDate, setDirectEndDate] = useState("");
  const [directExtending, setDirectExtending] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/trial-extension-requests");
      setRequests(data.requests || []);
    } catch (err) {
      showToast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      const days = approveDays[id] ?? 7;
      await axiosInstance.post(`/api/admin/trial-extension-requests/${id}/approve`, {
        extensionDays: days,
      });
      showToast.success(`Trial extended by ${days} days`);
      fetchRequests();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to approve");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioning(id);
    try {
      await axiosInstance.post(`/api/admin/trial-extension-requests/${id}/reject`, {
        reason: rejectReason[id] || undefined,
      });
      showToast.success("Request rejected");
      fetchRequests();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to reject");
    } finally {
      setActioning(null);
    }
  };

  const handleDirectExtend = async () => {
    if (!directUserId.trim()) {
      showToast.error("Select a user first");
      return;
    }
    if (!directExtendDays && !directEndDate) {
      showToast.error("Provide extension days or end date");
      return;
    }
    setDirectExtending(true);
    try {
      const body: { extensionDays?: number; newPeriodEnd?: string } = {};
      if (directEndDate) {
        body.newPeriodEnd = new Date(directEndDate).toISOString();
      } else {
        body.extensionDays = directExtendDays;
      }
      await axiosInstance.post(`/api/admin/users/${directUserId}/extend-trial`, body);
      showToast.success("Trial extended successfully");
      setDirectUserId("");
      setDirectEndDate("");
      setDirectExtendDays(7);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to extend trial");
    } finally {
      setDirectExtending(false);
    }
  };

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    try {
      const { data } = await axiosInstance.get("/api/admin/users");
      const users = (data.users || []).filter(
        (u: { name: string; email: string }) =>
          u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email?.toLowerCase().includes(userSearch.toLowerCase())
      );
      setSearchResults(users.slice(0, 10));
    } catch {
      setSearchResults([]);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const otherRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Trial Extensions</h1>
      </div>

      {/* Direct extend section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <UserPlus className="h-5 w-5" />
          Extend trial directly (unlimited)
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          For special requests, extend any user&apos;s Free Trial. You can do this as many times as needed.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-medium">User</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onBlur={() => setTimeout(searchUsers, 200)}
                className="flex-1 rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={searchUsers}
                className="rounded-md bg-gray-200 px-3 py-2 dark:bg-gray-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-40 overflow-y-auto rounded border bg-white dark:bg-gray-800">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setDirectUserId(u.id);
                      setSearchResults([]);
                      setUserSearch(u.email);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {u.name} ({u.email})
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-32">
            <label className="mb-1 block text-sm font-medium">Extension days</label>
            <input
              type="number"
              min={1}
              value={directExtendDays}
              onChange={(e) => setDirectExtendDays(Number(e.target.value) || 7)}
              disabled={!!directEndDate}
              className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-sm font-medium">Or set end date</label>
            <input
              type="date"
              value={directEndDate}
              onChange={(e) => setDirectEndDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDirectExtend}
              disabled={directExtending || !directUserId}
              className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {directExtending ? "Extending..." : "Extend trial"}
            </button>
          </div>
        </div>
      </div>

      {/* Pending requests */}
      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">
          Pending requests ({pendingRequests.length})
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 dark:border-gray-600"
              >
                <div>
                  <p className="font-medium">{req.user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{req.user.email}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Requested {format(new Date(req.requestedAt), "PPp")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Days:</label>
                    <input
                      type="number"
                      min={1}
                      className="w-16 rounded border px-2 py-1 dark:bg-gray-700"
                      value={approveDays[req.id] ?? 7}
                      onChange={(e) =>
                        setApproveDays((prev) => ({
                          ...prev,
                          [req.id]: Number(e.target.value) || 7,
                        }))
                      }
                    />
                  </div>
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={actioning === req.id}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {actioning === req.id ? "Approving..." : "Approve"}
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Rejection reason (optional)"
                      className="w-40 rounded border px-2 py-1 text-sm dark:bg-gray-700"
                      value={rejectReason[req.id] ?? ""}
                      onChange={(e) =>
                        setRejectReason((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actioning === req.id}
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent (non-pending) requests */}
      {otherRequests.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">Recent requests</h2>
          <div className="space-y-2">
            {otherRequests.slice(0, 20).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded border p-3 dark:border-gray-600"
              >
                <div>
                  <p className="font-medium">{req.user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{req.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 text-sm font-medium ${
                      req.status === "APPROVED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(req.requestedAt), "PP")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
