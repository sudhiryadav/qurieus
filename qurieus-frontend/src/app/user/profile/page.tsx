"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import PasswordForm from "@/components/Auth/PasswordForm";

export default function Profile() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    bio: "",
    currentPassword: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load user data from API when session is available
  useEffect(() => {
    const fetchUserProfile = async () => {
    if (session?.user) {
        try {
          const response = await fetch("/api/user/profile");
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
          const data = await response.json();
      setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            company: data.user.company || "",
            jobTitle: data.user.jobTitle || "",
            bio: data.user.bio || "",
            currentPassword: "",
      });
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile data");
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to update profile
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...formData,
        },
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    const response = await fetch("/api/user/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: formData.currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to change password");
    }

    toast.success("Password changed successfully");
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">Profile Settings</h1>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-dark-3 dark:bg-dark-1 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm dark:border-dark-3 dark:bg-dark-3 dark:text-gray-400 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-dark-3 dark:bg-dark-1 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="jobTitle" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-dark-3 dark:bg-dark-1 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-dark-3 dark:bg-dark-1 dark:text-white sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-dark-2"
              >
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-6 text-xl font-semibold text-dark dark:text-white">Change Password</h2>
          <PasswordForm
            onSubmit={handlePasswordChange}
            requireCurrentPassword={true}
          />
        </div>
      </div>
    </div>
  );
} 