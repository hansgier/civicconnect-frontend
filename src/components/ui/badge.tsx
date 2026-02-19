/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary ring-1 ring-primary/20",
        secondary:
          "border-transparent bg-secondary/10 text-secondary ring-1 ring-secondary/20",
        destructive:
          "border-transparent bg-destructive/10 text-destructive ring-1 ring-destructive/20",
        outline: 
          "text-foreground border-border/60 bg-background/50",
        soft: 
          "border-transparent bg-muted text-muted-foreground",
        planning: 
          "border-transparent bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
        progress: 
          "border-transparent bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
        completed: 
          "border-transparent bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
        urgent: 
          "border-transparent bg-red-500 text-white shadow-sm",
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
