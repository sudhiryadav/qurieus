"use client";

import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { Clock, Check, X, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

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
        <Clock className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trial Extensions</h1>
      </div>

      {/* Direct extend section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <UserPlus className="h-5 w-5" />
          Extend trial directly (unlimited)
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          For special requests, extend any user&apos;s Free Trial. You can do this as many times as needed.
        </p>
        <div className="flex flex-wrap gap-4">
          <FormField label="User" className="min-w-[200px] flex-1">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onBlur={() => setTimeout(searchUsers, 200)}
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="icon" onClick={searchUsers} aria-label="Search users">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-gray-200 bg-white dark:border-dark-3 dark:bg-dark-3">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setDirectUserId(u.id);
                      setSearchResults([]);
                      setUserSearch(u.email);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-dark-4"
                  >
                    {u.name} ({u.email})
                  </button>
                ))}
              </div>
            )}
          </FormField>
          <FormField label="Extension days" className="w-32">
            <Input
              type="number"
              min={1}
              value={directExtendDays}
              onChange={(e) => setDirectExtendDays(Number(e.target.value) || 7)}
              disabled={!!directEndDate}
            />
          </FormField>
          <FormField label="Or set end date" className="w-40">
            <Input
              type="date"
              value={directEndDate}
              onChange={(e) => setDirectEndDate(e.target.value)}
            />
          </FormField>
          <div className="flex items-end">
            <Button
              onClick={handleDirectExtend}
              loading={directExtending}
              disabled={!directUserId}
            >
              {directExtending ? "Extending..." : "Extend trial"}
            </Button>
          </div>
        </div>
      </div>

      {/* Pending requests */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Pending requests ({pendingRequests.length})
        </h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 dark:border-dark-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{req.user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{req.user.email}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Requested {format(new Date(req.requestedAt), "PPp")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FormField label="Days" className="w-20">
                      <Input
                        type="number"
                        min={1}
                        className="w-16"
                        value={approveDays[req.id] ?? 7}
                        onChange={(e) =>
                          setApproveDays((prev) => ({
                            ...prev,
                            [req.id]: Number(e.target.value) || 7,
                          }))
                        }
                      />
                    </FormField>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(req.id)}
                    loading={actioning === req.id}
                  >
                    <Check className="h-4 w-4" />
                    {actioning === req.id ? "Approving..." : "Approve"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      fieldSize="sm"
                      placeholder="Rejection reason (optional)"
                      className="w-40"
                      value={rejectReason[req.id] ?? ""}
                      onChange={(e) =>
                        setRejectReason((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(req.id)}
                      loading={actioning === req.id}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent (non-pending) requests */}
      {otherRequests.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent requests</h2>
          <div className="space-y-2">
            {otherRequests.slice(0, 20).map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded border border-gray-200 p-3 dark:border-dark-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{req.user.name}</p>
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
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
