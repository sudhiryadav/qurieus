"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Clock, Check, X } from "lucide-react";
import TestimonialForm from "@/components/TestimonialForm";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";

interface UserTestimonial {
  id: string;
  content: string;
  designation: string | null;
  star: number;
  status: string;
  isApproved: boolean;
  rejectionReason: string | null;
  rejectedAt: string | null;
  createdAt: string;
}

export default function FeedbackPage() {
  const [testimonials, setTestimonials] = useState<UserTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTestimonials = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/testimonials");
      setTestimonials(data.testimonials || []);
    } catch (err) {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTestimonials();
  }, [fetchMyTestimonials]);

  const hasPending = testimonials.some((t) => t.status === "PENDING");

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED")
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
          <Check className="h-3 w-3" /> Approved
        </span>
      );
    if (status === "REJECTED")
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-medium">
          <X className="h-3 w-3" /> Rejected
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
        <Clock className="h-3 w-3" /> Pending review
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Star className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-dark dark:text-white">Share Feedback</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2 max-w-2xl">
        <p className="text-muted-foreground mb-6">
          Your feedback helps us improve. Submit a testimonial and it will be reviewed by our team before appearing on the public testimonials section.
        </p>

        {hasPending && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You have a testimonial pending review. Please wait for our team to review it before submitting another. You will receive an email once it&apos;s been reviewed.
            </p>
          </div>
        )}

        {!hasPending && <TestimonialForm onSuccess={fetchMyTestimonials} />}

        {testimonials.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-3">
            <h2 className="text-sm font-medium text-dark dark:text-white mb-3">Your feedback history</h2>
            <div className="space-y-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-dark-1 border border-gray-100 dark:border-dark-3"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    {getStatusBadge(t.status)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(t.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-body-color dark:text-dark-6">"{t.content}"</p>
                  {t.status === "REJECTED" && t.rejectionReason && (
                    <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-200">
                      <span className="font-medium">Feedback from our team: </span>
                      {t.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          You can also{" "}
          <Link href="/#testimonials" className="text-primary hover:underline">
            share feedback from the testimonials section on our homepage
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
