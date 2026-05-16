import { cva } from "class-variance-authority"

/** Shared field styles — used by Input, Textarea, Select trigger, etc. */
const formControlBase = [
  "w-full rounded-md border border-gray-300 bg-white shadow-sm transition-colors",
  "text-gray-900 placeholder:text-gray-500",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:border-dark-3 dark:bg-dark-3 dark:text-gray-100 dark:placeholder:text-gray-500",
  "dark:focus-visible:ring-blue-400",
] as const

export const formControlVariants = cva(
  ["flex", ...formControlBase],
  {
    variants: {
      fieldSize: {
        default: "h-9 px-3 py-1 text-base md:text-sm",
        sm: "h-8 px-2.5 text-sm",
        lg: "h-10 px-3 py-2 text-base",
      },
    },
    defaultVariants: {
      fieldSize: "default",
    },
  }
)

export const textareaVariants = cva([
  ...formControlBase,
  "min-h-[80px] resize-y px-3 py-2 text-base md:text-sm",
])

/** Native date/time pickers — fixes dark-mode calendar icon contrast */
export const nativePickerVariants = cva([
  "[color-scheme:light]",
  "dark:[color-scheme:dark]",
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
  "[&::-webkit-calendar-picker-indicator]:opacity-90",
  "dark:[&::-webkit-calendar-picker-indicator]:invert",
  "[&::-webkit-datetime-edit]:text-gray-900",
  "dark:[&::-webkit-datetime-edit]:text-gray-100",
])

export const NATIVE_PICKER_TYPES = new Set([
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
])

export function isNativePickerType(
  type?: string
): type is "date" | "time" | "datetime-local" | "month" | "week" {
  return type !== undefined && NATIVE_PICKER_TYPES.has(type)
}
