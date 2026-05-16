"use client";

import { useState } from "react";
import { showToast } from "@/components/Common/Toast";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface TestimonialFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function TestimonialForm({ onSuccess, compact = false }: TestimonialFormProps) {
  const [content, setContent] = useState("");
  const [designation, setDesignation] = useState("");
  const [star, setStar] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast.error("Please enter your feedback");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/api/testimonials", {
        content: content.trim(),
        designation: designation.trim() || undefined,
        star,
      });
      showToast.success("Thank you! Your testimonial has been submitted for review.");
      setContent("");
      setDesignation("");
      setStar(5);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast.error(msg || "Failed to submit testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Your feedback" htmlFor="content" required>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with us..."
          rows={compact ? 3 : 4}
          required
        />
      </FormField>
      <FormField label="Designation (optional)" htmlFor="designation">
        <Input
          id="designation"
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="e.g. Founder @ Company"
        />
      </FormField>
      <FormField label="Rating">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStar(n)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
              aria-label={`${n} stars`}
            >
              <Star
                className={`h-6 w-6 ${n <= star ? "text-[#fbb040] fill-[#fbb040]" : "text-gray-300 dark:text-gray-600"}`}
              />
            </button>
          ))}
        </div>
      </FormField>
      <Button type="submit" loading={loading}>
        {loading ? "Submitting..." : "Submit testimonial"}
      </Button>
    </form>
  );
}

export default TestimonialForm;
