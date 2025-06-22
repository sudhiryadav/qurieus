"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { showToast } from "@/components/Common/Toast";
import { validateEmail } from "@/utils/validateEmail";
import Loader from "@/components/Common/LoadingOverlay";
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
        <input
          type="email"
          placeholder="Email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
        />
      </div>
      <div className="mb-9">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send Magic Link {loading && <Loader />}
        </button>
      </div>
    </form>
  );
};

export default MagicLink;
