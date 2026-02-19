"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-0 relative items-center mb-4 px-10",
        caption_label: "text-sm font-semibold tracking-tight text-zinc-900",
        nav: "flex items-center absolute inset-x-0 top-0 justify-between px-2 z-10",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-14 mt-3 bg-transparent p-0 opacity-40 hover:opacity-100 transition-all duration-200 active:scale-90 rounded-full hover:bg-zinc-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 mt-3 bg-transparent p-0 opacity-40 hover:opacity-100 transition-all duration-200 active:scale-90 rounded-full hover:bg-zinc-100"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday: "text-zinc-400 rounded-md w-9 font-medium text-[0.7rem] uppercase tracking-wider text-center",
        week: "flex w-full mt-1.5 justify-between",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal transition-all duration-200 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 active:scale-90 text-zinc-700"
        ),
        day_button: "h-full w-full flex items-center justify-center rounded-xl",
        range_start: "day-range-start day-selected bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        range_end: "day-range-end day-selected bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/20 opacity-100",
        today: "text-primary font-bold relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
        outside: "text-zinc-300 opacity-50 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-zinc-200 opacity-20",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') return <ChevronLeft className="h-4 w-4" />
          return <ChevronRight className="h-4 w-4" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
