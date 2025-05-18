"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { validateEmail } from "@/utils/validateEmail";
import Loader from "@/components/Common/Loader";
import { useRouter, useSearchParams } from "next/navigation";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Please enter your email address.");
    }

    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email address.");
    }

    try {
      setLoader(true);
      
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error || "Unable to send email");
      } else {
        toast.success("Magic link sent to your email");
        setEmail("");
        router.push("/verify-request");
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Unable to send email!");
    } finally {
      setLoader(false);
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
          disabled={loader}
          className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send Magic Link {loader && <Loader />}
        </button>
      </div>
    </form>
  );
};

export default MagicLink;
