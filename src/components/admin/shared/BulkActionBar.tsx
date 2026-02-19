import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onDelete: () => void;
  onDeselectAll: () => void;
  isDeleting?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onDelete,
  onDeselectAll,
  isDeleting,
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-4 rounded-full border bg-card px-6 py-3 shadow-lg">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <div className="h-4 w-px bg-border" />
        <Button
          variant="destructive"
          size="sm"
          className="rounded-full"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="mr-0 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-8 w-8 p-0"
          onClick={onDeselectAll}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
