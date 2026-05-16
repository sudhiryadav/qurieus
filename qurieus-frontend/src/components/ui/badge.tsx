import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-dark-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow-sm hover:bg-primary/90",
        secondary:
          "border-transparent bg-gray-200 text-gray-800 shadow-sm hover:bg-gray-300 dark:bg-dark-3 dark:text-gray-100 dark:hover:bg-dark-4",
        destructive:
          "border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-800",
        outline:
          "border border-gray-300 text-gray-900 dark:border-dark-3 dark:text-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 