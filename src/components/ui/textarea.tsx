import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-zinc-200 bg-background px-4 py-3 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 ease-out",
        "placeholder:text-zinc-400",
        "hover:border-zinc-300",
        "focus:border-primary focus:outline-none focus:shadow-[0_0_0_1px_rgba(var(--primary),1),0_0_0_4px_rgba(var(--primary),0.08)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-zinc-800 dark:bg-background dark:hover:border-zinc-700 dark:placeholder:text-zinc-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
