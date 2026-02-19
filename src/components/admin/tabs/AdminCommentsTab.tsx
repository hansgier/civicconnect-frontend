import { useState, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  AdminDataTable,
  BulkActionBar,
  ConfirmDialog,
  StatusBadge,
  SearchFilterBar,
  AdminEmptyState,
  LoadingSkeleton,
} from '@/components/admin/shared';
import {
  useAdminCommentsList,
  useDeleteComment,
  useDeleteCommentsBulk,
} from '@/hooks/admin/use-admin-comments';
import { useAdminProjectsList } from '@/hooks/admin/use-admin-projects';
import { Button } from '@/components/ui/button';
import type { ApiComment } from '@/types/api';

export function AdminCommentsTab() {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('none');
  const [officialFilter, setOfficialFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const { data: projectsData } = useAdminProjectsList({ limit: 100 });
  const { data, isLoading } = useAdminCommentsList({
    page,
    search: search || undefined,
    projectId: projectFilter !== 'none' ? projectFilter : undefined,
    isOfficial: officialFilter === 'official' ? true : officialFilter === 'unofficial' ? false : undefined,
    sortBy: sortConfig.key as keyof ApiComment,
    sortOrder: sortConfig.direction,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const deleteMutation = useDeleteComment();
  const bulkDeleteMutation = useDeleteCommentsBulk();

  const projectOptions = [
    { value: 'none', label: 'Select Project...' },
    ...(projectsData?.data.map((p) => ({ value: p.id, label: p.title })) || []),
  ];

  const officialOptions = [
    { value: 'all', label: 'All Comments' },
    { value: 'official', label: 'Official Only' },
    { value: 'unofficial', label: 'Unofficial Only' },
  ];

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    const allIds = data.data.map((c) => c.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  }, [data, selectedIds]);

  const handleDelete = (id: string) => {
    const comment = data?.data.find((c) => c.id === id);
    if (!comment) return;

    deleteMutation.mutate(
      { commentId: id, projectId: comment.projectId },
      {
        onSuccess: () => {
          toast.success('Comment deleted successfully');
          setDeleteConfirmId(null);
        },
        onError: () => {
          toast.error('Failed to delete comment');
        },
      }
    );
  };

  const handleBulkDelete = () => {
    const itemsToDelete = selectedIds
      .map((id) => {
        const comment = data?.data.find((c) => c.id === id);
        return comment ? { id: comment.id, projectId: comment.projectId } : null;
      })
      .filter((item): item is { id: string; projectId: string } => item !== null);

    bulkDeleteMutation.mutate(itemsToDelete, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} comments deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete comments');
      },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const columns = [
    {
      key: 'content',
      header: 'Content',
      accessor: (c: ApiComment) => (
        <div className='max-w-md'>
          <p className='text-sm'>{truncateContent(c.content)}</p>
          {c.isOfficial && <StatusBadge status='completed' className='mt-1'>Official</StatusBadge>}
        </div>
      ),
      sortable: true
    },
    { key: 'userId', header: 'Author', accessor: (c: ApiComment) => c.user?.name || 'Unknown' },
    {
      key: 'project',
      header: 'Project',
      accessor: (c: ApiComment) => (
        <Link to={`/projects/${c.projectId}`} className="text-primary hover:underline text-sm">
          View Project
        </Link>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      accessor: (c: ApiComment) => new Date(c.createdAt).toLocaleDateString(),
      sortable: true
    },
    {
      key: 'actions',
      header: '',
      accessor: (c: ApiComment) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteConfirmId(c.id)}
          >
            ×
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search comments..."
        filters={[
          {
            key: 'project',
            label: 'Project',
            options: projectOptions,
            value: projectFilter,
            onChange: (value) => { setProjectFilter(value); setPage(1); },
          },
          {
            key: 'official',
            label: 'Status',
            options: officialOptions,
            value: officialFilter,
            onChange: (value) => { setOfficialFilter(value); setPage(1); },
          },
        ]}
      />

      {projectFilter === 'none' ? (
        <AdminEmptyState
          title="⚠️ Project Selection Required"
          description="Please select a project from the dropdown filter above to view and moderate its comments."
        />
      ) : data?.data.length === 0 ? (
        <AdminEmptyState
          title="No comments found"
          description="There are no comments to moderate"
        />
      ) : (
        <AdminDataTable
          data={data?.data || []}
          columns={columns}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          sortColumn={sortConfig.key}
          sortDirection={sortConfig.direction}
          onSort={handleSort}
          getRowId={(c) => c.id}
          pagination={{
            page: page,
            totalPages: data?.pagination.totalPages || 1,
            totalItems: data?.pagination.total || 0,
            onPageChange: setPage,
          }}
          emptyState={<AdminEmptyState title="No comments" description="No comments match your filters" />}
        />
      )}

      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          totalCount={data?.pagination.total || 0}
          onDelete={() => setIsBulkDeleteOpen(true)}
          onDeselectAll={() => setSelectedIds([])}
          isDeleting={bulkDeleteMutation.isPending}
        />
      )}



      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Comments"
        description={`Are you sure you want to delete ${selectedIds.length} comments? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
