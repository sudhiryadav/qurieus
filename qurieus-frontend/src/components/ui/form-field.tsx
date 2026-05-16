import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export type FormFieldProps = {
  label: React.ReactNode
  htmlFor?: string
  children: React.ReactNode
  className?: string
  /** Helper text below the control */
  description?: React.ReactNode
  /** Validation or API error */
  error?: React.ReactNode
  required?: boolean
}

/**
 * Label + control + optional description/error — use with Input, Textarea, Select, etc.
 */
export function FormField({
  label,
  htmlFor,
  children,
  className,
  description,
  error,
  required,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="mb-0">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600 dark:text-red-400" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {description ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
