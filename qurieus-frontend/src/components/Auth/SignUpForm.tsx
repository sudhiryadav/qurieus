import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SwitchOption } from "./SwitchOption";
import { Loader } from "@/components/Loader";
import { MagicLink } from "./MagicLink";

interface SignUpFormProps {
  onSuccess?: () => void;
  className?: string;
}

export default function SignUpForm({ onSuccess, className = "" }: SignUpFormProps) {
  const router = useRouter();
  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const email = user.email;

      if (process.env.NODE_ENV !== 'development' && !isBusinessEmail(email)) {
        toast.error('Please use a business email address');
        setLoading(false);
        return;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Registration failed");
      }

      toast.success(responseData.message || "Registration successful! Please check your email to verify your account.");
      onSuccess?.();
      router.push("/signin");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-[480px] rounded-lg bg-white dark:bg-dark-2 p-8 shadow-lg mx-auto ${className}`}>
      <div className="mb-6">
        <Logo width={40} height={40} showBrandName />
      </div>
      <h2 className="mb-2 text-center text-3xl font-bold text-dark dark:text-white">Create your account</h2>
      <p className="mb-8 text-center text-base text-body-color dark:text-dark-6">
        Or{' '}
        <Link href="/signin" className="font-medium text-primary hover:text-primary-dark">
          sign in to your account
        </Link>
      </p>
      <SwitchOption isPassword={isPassword} setIsPassword={setIsPassword} />

      {isPassword ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-[22px]">
            <input
              type="text"
              placeholder="Name"
              name="name"
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
          <div className="mb-[22px]">
            <input
              type="email"
              placeholder="Email"
              name="email"
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="mb-[22px]">
            <input
              type="password"
              placeholder="Password"
              name="password"
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              value={user.password}
            />
          </div>
          <div className="mb-9">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Up {loading && <Loader />}
            </button>
          </div>
        </form>
      ) : (
        <MagicLink />
      )}

      <p className="text-body-secondary mb-4 text-base">
        By creating an account you are agree with our{" "}
        <Link href="/#" className="text-primary hover:underline">
          Privacy
        </Link>{" "}
        and{" "}
        <Link href="/#" className="text-primary hover:underline">
          Policy
        </Link>
      </p>
    </div>
  );
}

// Helper function to check if email is a business email
function isBusinessEmail(email: string): boolean {
  const personalEmailDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'mail.com',
    'protonmail.com',
    'zoho.com',
    'yandex.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !personalEmailDomains.includes(domain) : false;
} 