import { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { SortOption, AnnouncementSortOption } from '@/types';

interface SortDropdownProps {
  type: 'projects' | 'announcements';
  value: SortOption | AnnouncementSortOption;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
}

const projectSortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-approved', label: 'Most Approved' },
  { value: 'least-approved', label: 'Least Approved' },
  { value: 'budget-high', label: 'Budget: High to Low' },
  { value: 'budget-low', label: 'Budget: Low to High' },
];

const announcementSortOptions: { value: AnnouncementSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export function SortDropdown({ type, value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = type === 'projects' ? projectSortOptions : announcementSortOptions;
  const selectedLabel = options.find((opt) => opt.value === value)?.label || 'Sort by';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">{selectedLabel}</span>
          <span className="sm:hidden">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{option.label}</span>
            {value === option.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
