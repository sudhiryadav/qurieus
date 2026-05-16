import * as React from "react"

import { cn } from "@/lib/utils"
import { formControlVariants } from "@/components/ui/form-control"

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(formControlVariants(), className)}
      ref={ref}
      {...props}
    />
  )
})
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
