"use client";

import { Testimonial } from "@/types/testimonial";
import SectionTitle from "../Common/SectionTitle";
import SingleTestimonial from "./SingleTestimonial";
import TestimonialForm from "../TestimonialForm";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

const Testimonials = () => {
  const { data: session, status } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = () => {
    axiosInstance
      .get<{ testimonials: Testimonial[] }>("/api/testimonials")
      .then((res) => setTestimonials(res.data.testimonials || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const isLoggedIn = status === "authenticated" && session?.user && session.user.role !== "AGENT";

  return (
    <section id="testimonials" className="bg-gray-1 py-20 dark:bg-dark-2 md:py-[120px]">
      <div className="container px-4">
        <SectionTitle
          subtitle="Testimonials"
          title="What our Client Say"
          paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
          width="640px"
          center
        />

        <div className="mt-[60px] flex flex-wrap lg:mt-20 gap-y-8">
          {loading ? (
            <div className="w-full text-center py-12 text-muted-foreground">
              Loading testimonials...
            </div>
          ) : testimonials.length > 0 ? (
            testimonials.map((t) => (
              <SingleTestimonial key={t.id} testimonial={t} />
            ))
          ) : (
            <div className="w-full text-center py-12 text-muted-foreground">
              No testimonials yet. Be the first to share your experience!
            </div>
          )}
        </div>

        {isLoggedIn && (
          <div className="mt-12 w-full max-w-2xl mx-auto">
            <div className="rounded-xl bg-white px-6 py-6 shadow-testimonial dark:bg-dark sm:px-8">
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                Share your experience
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your feedback helps us improve. Submit a testimonial and it will be reviewed by our team before appearing on this page.
              </p>
              <TestimonialForm onSuccess={fetchTestimonials} compact />
            </div>
          </div>
        )}

        {!isLoggedIn && status !== "loading" && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
              {" "}to share your feedback and testimonial.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
