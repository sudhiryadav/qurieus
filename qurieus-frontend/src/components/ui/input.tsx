import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  formControlVariants,
  isNativePickerType,
  nativePickerVariants,
} from "@/components/ui/form-control"

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof formControlVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    const picker = isNativePickerType(type)

    return (
      <input
        type={type}
        className={cn(
          formControlVariants({ size }),
          picker && nativePickerVariants(),
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900 dark:file:text-gray-100",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
