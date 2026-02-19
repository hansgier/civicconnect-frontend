import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  sortColumn?: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  getRowId: (row: T) => string;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  emptyState: React.ReactNode;
}

export function AdminDataTable<T>({
  data,
  columns,
  selectedIds,
  onSelect,
  onSelectAll,
  sortColumn,
  sortDirection,
  onSort,
  getRowId,
  pagination,
  emptyState,
}: AdminDataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(getRowId(row)));
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border bg-card overflow-hidden backdrop-blur-xl">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card overflow-hidden backdrop-blur-xl">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left align-middle w-[40px]">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                  onCheckedChange={onSelectAll}
                  className="h-4 w-4 rounded-sm border-muted"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm',
                    column.sortable && 'cursor-pointer hover:text-foreground select-none',
                    column.width
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.includes(rowId);

              return (
                <tr
                  key={rowId}
                  data-selected={isSelected}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    'data-[selected=true]:bg-primary/5'
                  )}
                >
                  <td className="h-14 px-4 align-middle">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelect(rowId)}
                      className="h-4 w-4 rounded-sm border-muted"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="h-14 px-4 align-middle text-sm">
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * 20) + 1} to {Math.min(pagination.page * 20, pagination.totalItems)} of {pagination.totalItems} results
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 text-sm rounded-md border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 text-sm rounded-md border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
