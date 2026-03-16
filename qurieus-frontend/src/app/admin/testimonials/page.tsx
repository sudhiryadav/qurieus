"use client";

import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { MessageSquare, Check, X, History, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { UserAvatar } from "@/components/UserAvatar";
import ModalDialog from "@/components/ui/ModalDialog";

interface TestimonialItem {
  id: string;
  content: string;
  designation: string | null;
  star: number;
  isApproved: boolean;
  status: string;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    jobTitle: string | null;
    company: string | null;
  };
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [rejectModal, setRejectModal] = useState<{ id: string; content: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<Record<string, TestimonialItem[]>>({});

  const fetchTestimonials = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/testimonials");
      setTestimonials(data.testimonials || []);
    } catch (err) {
      showToast.error("Failed to fetch testimonials");
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const fetchUserHistory = useCallback(async (userId: string) => {
    if (userHistory[userId]) return;
    try {
      const { data } = await axiosInstance.get(`/api/admin/testimonials/user/${userId}`);
      setUserHistory((prev) => ({ ...prev, [userId]: data.testimonials || [] }));
    } catch (err) {
      showToast.error("Failed to fetch user history");
    }
  }, [userHistory]);

  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      await axiosInstance.post(`/api/admin/testimonials/${id}/approve`);
      showToast.success("Testimonial approved");
      fetchTestimonials();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to approve");
    } finally {
      setActioning(null);
    }
  };

  const openRejectModal = (t: TestimonialItem) => {
    setRejectModal({ id: t.id, content: t.content });
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActioning(rejectModal.id);
    try {
      await axiosInstance.post(`/api/admin/testimonials/${rejectModal.id}/reject`, {
        rejectionReason: rejectionReason.trim() || undefined,
      });
      showToast.success("Testimonial rejected. User will be notified by email.");
      setRejectModal(null);
      setRejectionReason("");
      fetchTestimonials();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to reject");
    } finally {
      setActioning(null);
    }
  };

  const toggleUserHistory = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      fetchUserHistory(userId);
    }
  };

  const filtered = testimonials.filter((t) => {
    if (filter === "pending") return t.status === "PENDING";
    if (filter === "approved") return t.status === "APPROVED";
    if (filter === "rejected") return t.status === "REJECTED";
    return true;
  });

  const pendingCount = testimonials.filter((t) => t.status === "PENDING").length;
  const rejectedCount = testimonials.filter((t) => t.status === "REJECTED").length;

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED")
      return (
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
          Approved
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium">
          Rejected
        </span>
      );
    return (
      <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
        Pending
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-dark dark:text-white">Testimonials</h1>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Review and approve user testimonials. Only approved testimonials appear on the public landing page. Rejected users receive an email with your feedback.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("approved")}
        >
          Approved
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("rejected")}
        >
          Rejected ({rejectedCount})
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      <div className="space-y-4">
        <LoadingOverlay loading={loading} htmlText="Loading testimonials..." position="absolute" />
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 p-12 text-center text-muted-foreground">
            {loading ? null : filter === "pending"
              ? "No pending testimonials."
              : filter === "approved"
                ? "No approved testimonials yet."
                : filter === "rejected"
                  ? "No rejected testimonials."
                  : "No testimonials yet."}
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-gray-200 dark:border-dark-3 bg-white dark:bg-dark-2 p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <UserAvatar
                    name={t.user.name}
                    image={t.user.image}
                    userId={t.user.id}
                    size="lg"
                    className="h-12 w-12"
                  />
                  <div>
                    <p className="font-medium text-dark dark:text-white">{t.user.name}</p>
                    <p className="text-sm text-muted-foreground">{t.user.email}</p>
                    {(t.designation || t.user.jobTitle || t.user.company) && (
                      <p className="text-xs text-muted-foreground">
                        {t.designation || [t.user.jobTitle, t.user.company].filter(Boolean).join(" @ ")}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto py-1 px-0 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => toggleUserHistory(t.user.id)}
                    >
                      <History className="h-3 w-3 mr-1 inline" />
                      {expandedUser === t.user.id ? "Hide history" : "View history"}
                      {expandedUser === t.user.id ? <ChevronUp className="h-3 w-3 ml-1 inline" /> : <ChevronDown className="h-3 w-3 ml-1 inline" />}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: t.star }).map((_, i) => (
                      <span key={i} className="text-[#fbb040]">★</span>
                    ))}
                  </div>
                  <p className="text-body-color dark:text-dark-6">"{t.content}"</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted {format(new Date(t.createdAt), "MMM d, yyyy")}
                  </p>
                  {t.status === "REJECTED" && t.rejectionReason && (
                    <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Admin feedback:</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">{t.rejectionReason}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "APPROVED" ? (
                    getStatusBadge(t.status)
                  ) : t.status === "REJECTED" ? (
                    getStatusBadge(t.status)
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(t.id)}
                        disabled={actioning === t.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {actioning === t.id ? "..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRejectModal(t)}
                        disabled={actioning === t.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {expandedUser === t.user.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-3">
                  <p className="text-sm font-medium text-dark dark:text-white mb-2">Feedback history for {t.user.name}</p>
                  {userHistory[t.user.id] ? (
                    <div className="space-y-2">
                      {userHistory[t.user.id].map((hist) => (
                        <div
                          key={hist.id}
                          className="p-3 rounded bg-gray-50 dark:bg-dark-1 text-sm"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-body-color dark:text-dark-6">"{hist.content}"</p>
                            {getStatusBadge(hist.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(hist.createdAt), "MMM d, yyyy")}
                            {hist.rejectionReason && ` • Rejection: ${hist.rejectionReason}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ModalDialog
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        header="Reject testimonial"
        width="90%"
        maxHeight="70vh"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!actioning}>
              {actioning ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The user will receive an email notification. Add a comment below to suggest changes so they can submit a revised testimonial.
          </p>
          <div>
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-dark dark:text-white mb-1">
              Feedback for user (optional)
            </label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please add more specific details about your experience, or fix the typo in..."
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-dark-3 dark:bg-dark-1 dark:text-white"
            />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
