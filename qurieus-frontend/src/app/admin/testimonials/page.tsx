"use client";

import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { MessageSquare, Check, X, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { UserAvatar } from "@/components/UserAvatar";

interface TestimonialItem {
  id: string;
  content: string;
  designation: string | null;
  star: number;
  isApproved: boolean;
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
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

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

  const handleReject = async (id: string) => {
    setActioning(id);
    try {
      await axiosInstance.post(`/api/admin/testimonials/${id}/reject`);
      showToast.success("Testimonial rejected");
      fetchTestimonials();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to reject");
    } finally {
      setActioning(null);
    }
  };

  const filtered = testimonials.filter((t) => {
    if (filter === "pending") return !t.isApproved;
    if (filter === "approved") return t.isApproved;
    return true;
  });

  const pendingCount = testimonials.filter((t) => !t.isApproved).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-dark dark:text-white">Testimonials</h1>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Review and approve user testimonials. Only approved testimonials appear on the public landing page.
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
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.isApproved ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
                      Approved
                    </span>
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
                        onClick={() => handleReject(t.id)}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
