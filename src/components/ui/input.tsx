import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-gray-500 bg-background px-4 py-2 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 ease-out",
        "placeholder:text-zinc-400",
        "hover:border-zinc-300",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // "dark:border-zinc-800 dark:bg-background dark:hover:border-zinc-700 dark:placeholder:text-zinc-500",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
