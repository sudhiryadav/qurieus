"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { showToast } from "@/components/Common/Toast";
import { validateEmail } from "@/utils/validateEmail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      return showToast.error("Please enter your email address.");
    }

    if (!validateEmail(email)) {
      return showToast.error("Please enter a valid email address.");
    }

    try {
      const response = await axios.post("/api/auth/magic-link", {
        email,
      });

      showToast.success("Magic link sent to your email!");
      setSent(true);
    } catch (error: any) {
      showToast.error(error.response?.data?.error || "Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[22px]">
        <Input
          type="email"
          placeholder="Email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          size="lg" className="border-stroke bg-transparent text-dark placeholder:text-dark-6 dark:border-dark-3 dark:bg-transparent dark:text-white"
        />
      </div>
      <div className="mb-9">
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send Magic Link
        </Button>
      </div>
    </form>
  );
};

export default MagicLink;
