"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: string | Date
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function DatePicker({
  date,
  onChange,
  placeholder = "Select date",
  className,
  id
}: DatePickerProps) {
  const memoizedDate = React.useMemo(() => {
    if (!date) return undefined
    const d = new Date(date)
    return isNaN(d.getTime()) ? undefined : d
  }, [date])

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(memoizedDate)

  // Update internal state when prop changes
  React.useEffect(() => {
    setSelectedDate(memoizedDate)
  }, [memoizedDate])

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (onChange) {
      onChange(date ? format(date, "yyyy-MM-dd") : "")
    }
  }

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleSelect(undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-medium h-11 px-4 rounded-xl border border-zinc-200 bg-background hover:bg-background hover:border-zinc-300 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
            !selectedDate && "text-zinc-400 font-normal",
            "dark:border-zinc-800 dark:bg-background dark:hover:border-zinc-700 dark:placeholder:text-zinc-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary opacity-70" />
          <span className="flex-1 truncate">
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </span>
          {selectedDate && (
            <div 
              onClick={clearDate}
              className="ml-2 p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </div>
          )}
          <ChevronDown className="ml-1 h-4 w-4 opacity-20" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 border border-zinc-200 shadow-2xl rounded-2xl bg-white overflow-hidden mt-2" 
        align="start"
        sideOffset={8}
      >
        <div className="p-1 bg-white">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </div>
        
        <div className="flex items-center justify-between p-2.5 border-t border-zinc-100 bg-white gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-[10px] font-bold uppercase hover:bg-zinc-50 text-zinc-500 hover:text-primary rounded-lg transition-all active:scale-95"
            onClick={() => handleSelect(new Date())}
          >
            Today
          </Button>
          <div className="w-[1px] h-3 bg-zinc-100" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-[10px] font-bold uppercase text-zinc-500 hover:bg-destructive/5 hover:text-destructive rounded-lg transition-all active:scale-95"
            onClick={() => handleSelect(undefined)}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
