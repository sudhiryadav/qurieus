"use client";

import PasswordForm from "@/components/Auth/PasswordForm";
import { showToast } from "@/components/Common/Toast";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { User as UserIcon, Camera } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Profile() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    bio: "",
    image: "" as string | null,
    currentPassword: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data from API when session is available
  useEffect(() => {
    const fetchUserProfile = async () => {
    if (session?.user) {
        try {
          const response = await axiosInstance.get("/api/user/profile");
          const data = response.data;
      setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            company: data.user.company || "",
            jobTitle: data.user.jobTitle || "",
            bio: data.user.bio || "",
            image: data.user.image || null,
            currentPassword: "",
      });
        } catch (error) {
          showToast.error("Failed to load profile data");
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
      await axiosInstance.put("/api/user/profile", formData);

      // Update session data (exclude image - it's resolved via avatar API)
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          company: formData.company,
          jobTitle: formData.jobTitle,
          bio: formData.bio,
        },
      });

      showToast.success("Profile updated successfully");
    } catch (error) {
      showToast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axiosInstance.post("/api/user/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image: res.data.image }));
      await update({ ...session, user: { ...session.user, image: res.data.image } });
      showToast.success("Avatar updated successfully");
    } catch (err: any) {
      showToast.error(err.response?.data?.error || "Failed to upload avatar");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    try {
      await axiosInstance.post("/api/user/change-password", {
        currentPassword: formData.currentPassword,
        newPassword,
      });
      showToast.success("Password changed successfully");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <div className="mb-6 flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
              disabled={avatarLoading}
            >
              <UserAvatar
                name={formData.name || "User"}
                image={formData.image}
                userId={session?.user?.id}
                size="lg"
                className="h-20 w-20"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </span>
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Profile photo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPEG, PNG or WebP. Max 2MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="mt-1 text-sm text-blue-600 hover:underline disabled:opacity-70 dark:text-blue-400"
              >
                {avatarLoading ? "Uploading..." : "Change photo"}
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Full Name" htmlFor="name">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormField>
              <FormField
                label="Email"
                htmlFor="email"
                description="Email cannot be changed"
              >
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="cursor-not-allowed dark:text-gray-400"
                />
              </FormField>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Company" htmlFor="company">
                <Input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Job Title" htmlFor="jobTitle">
                <Input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <FormField label="Bio" htmlFor="bio">
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </FormField>

            <div className="flex justify-end">
              <Button type="submit" loading={loading} className="ml-3">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark-2">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
          <PasswordForm
            onSubmit={handlePasswordChange}
            requireCurrentPassword={true}
          />
        </div>
      </div>
    </div>
  );
} 