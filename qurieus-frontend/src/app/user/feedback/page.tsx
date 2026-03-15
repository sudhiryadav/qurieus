"use client";

import { Star } from "lucide-react";
import TestimonialForm from "@/components/TestimonialForm";
import Link from "next/link";

export default function FeedbackPage() {
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
        <TestimonialForm />
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
