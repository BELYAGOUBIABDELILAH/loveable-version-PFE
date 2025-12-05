/**
 * Button Component - Google Antigravity Design System
 * Requirements: 20.4, 20.5
 * - Pill shape (border-radius: 9999px)
 * - Primary variant: black background (#1F1F1F)
 * - Secondary variant: light grey background (#F1F3F4)
 * - Soft shadows
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Black pill button per Google Antigravity Design
        default: "bg-[#1F1F1F] text-white rounded-full shadow-soft hover:opacity-90",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground rounded-full shadow-soft hover:bg-destructive/90",
        // Outline
        outline:
          "border border-input bg-background rounded-full hover:bg-[#F1F3F4] hover:text-[#202124]",
        // Secondary - Light grey pill button per Google Antigravity Design
        secondary:
          "bg-[#F1F3F4] text-[#202124] rounded-full shadow-soft hover:bg-gray-200",
        // Ghost
        ghost: "rounded-full hover:bg-[#F1F3F4] hover:text-[#202124]",
        // Link
        link: "text-[#4285F4] underline-offset-4 hover:underline",
        // Accent - Google Blue
        accent: "bg-[#4285F4] text-white rounded-full shadow-soft hover:bg-[#3367D6]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
