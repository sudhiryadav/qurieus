"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function PasswordInput({ label, error, className = "", id, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const field = (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        className={`pr-10 ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );

  if (label) {
    return (
      <FormField label={label} htmlFor={id} error={error}>
        {field}
      </FormField>
    );
  }

  return (
    <div>
      {field}
      {error ? <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
