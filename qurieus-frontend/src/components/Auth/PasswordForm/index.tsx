"use client";
import PasswordInput from "@/components/Common/PasswordInput";
import { showToast } from "@/components/Common/Toast";
import { useState } from "react";

interface PasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  submitButtonText?: string;
  requireCurrentPassword?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export default function PasswordForm({
  onSubmit,
  submitButtonText = "Change Password",
  requireCurrentPassword = false,
  className = "",
  onSuccess,
}: PasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (requireCurrentPassword && !formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData.newPassword);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast.success("Password updated successfully");
      onSuccess?.();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {requireCurrentPassword && (
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          label="Current Password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          error={errors.currentPassword}
        />
      )}

      <PasswordInput
        id="newPassword"
        name="newPassword"
        label="New Password"
        value={formData.newPassword}
        onChange={handleChange}
        required
        minLength={8}
        error={errors.newPassword}
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm New Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        minLength={8}
        error={errors.confirmPassword}
      />

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
              {submitButtonText}...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
} 