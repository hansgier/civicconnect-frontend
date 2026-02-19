import { useState, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  AdminDataTable,
  BulkActionBar,
  ConfirmDialog,
  SearchFilterBar,
  ActionButtons,
  AdminEmptyState,
  LoadingSkeleton,
} from '@/components/admin/shared';
import { UpdateForm, type UpdateFormData } from '@/components/admin/forms';
import {
  useAdminUpdatesList,
  useCreateUpdate,
  useUpdateUpdate,
  useDeleteUpdate,
  useDeleteUpdatesBulk,
} from '@/hooks/admin/use-admin-updates';
import { useAdminProjectsList } from '@/hooks/admin/use-admin-projects';
import type { ApiProjectUpdate } from '@/types/api';

export function AdminUpdatesTab() {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('none');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ApiProjectUpdate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const { data: projectsData } = useAdminProjectsList({ limit: 100 });
  const { data, isLoading } = useAdminUpdatesList({
    page,
    search: search || undefined,
    projectId: projectFilter !== 'none' ? projectFilter : undefined,
    sortBy: sortConfig.key as keyof ApiProjectUpdate,
    sortOrder: sortConfig.direction,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const createMutation = useCreateUpdate();
  const updateMutation = useUpdateUpdate();
  const deleteMutation = useDeleteUpdate();
  const bulkDeleteMutation = useDeleteUpdatesBulk();

  const projectOptions = [
    { value: 'none', label: 'Select Project...' },
    ...(projectsData?.data.map((p) => ({ value: p.id, label: p.title })) || []),
  ];

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    const allIds = data.data.map((u) => u.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  }, [data, selectedIds]);

  const handleCreate = (formData: UpdateFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Update created successfully');
        setIsCreateOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create update');
      },
    });
  };

  const handleUpdate = (formData: UpdateFormData) => {
    if (!editingUpdate) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectId: _, ...rest } = formData;
    updateMutation.mutate(
      { updateId: editingUpdate.id, projectId: editingUpdate.projectId, ...rest },
      {
        onSuccess: () => {
          toast.success('Update saved successfully');
          setEditingUpdate(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to save update');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    const update = data?.data.find((u) => u.id === id);
    if (!update) return;

    deleteMutation.mutate(
      { updateId: id, projectId: update.projectId },
      {
        onSuccess: () => {
          toast.success('Update deleted successfully');
          setDeleteConfirmId(null);
        },
        onError: () => {
          toast.error('Failed to delete update');
        },
      }
    );
  };

  const handleBulkDelete = () => {
    const itemsToDelete = selectedIds
      .map((id) => {
        const update = data?.data.find((u) => u.id === id);
        return update ? { id: update.id, projectId: update.projectId } : null;
      })
      .filter((item): item is { id: string; projectId: string } => item !== null);

    bulkDeleteMutation.mutate(itemsToDelete, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} updates deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete updates');
      },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const getProjectTitle = (projectId: string) => {
    return projectsData?.data.find((p) => p.id === projectId)?.title || 'Unknown Project';
  };

  const columns = [
    { key: 'title', header: 'Title', accessor: (u: ApiProjectUpdate) => u.title, sortable: true },
    { key: 'project', header: 'Project', accessor: (u: ApiProjectUpdate) => (
      <Link to={`/projects/${u.projectId}`} className="text-primary hover:underline">
        {getProjectTitle(u.projectId)}
      </Link>
    )},
    { key: 'date', header: 'Date', accessor: (u: ApiProjectUpdate) => u.date ? new Date(u.date).toLocaleDateString() : '-', sortable: true },
    {
      key: 'actions',
      header: '',
      accessor: (u: ApiProjectUpdate) => (
        <div className="group">
          <ActionButtons
            onEdit={() => setEditingUpdate(u)}
            onDelete={() => setDeleteConfirmId(u.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search updates..."
        filters={[
          {
            key: 'project',
            label: 'Project',
            options: projectOptions,
            value: projectFilter,
            onChange: (value) => { setProjectFilter(value); setPage(1); },
          },
        ]}
        onAddNew={() => setIsCreateOpen(true)}
        addNewLabel="Add Update"
      />

      {projectFilter === 'none' ? (
        <AdminEmptyState
          title="⚠️ Project Selection Required"
          description="Please select a project from the dropdown filter above to view, create, or manage its updates."
        />
      ) : data?.data.length === 0 ? (
        <AdminEmptyState
          title="No updates found"
          description="Get started by creating a new project update"
          actionLabel="Add Update"
          onAction={() => setIsCreateOpen(true)}
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
          getRowId={(u) => u.id}
          pagination={{
            page: page,
            totalPages: data?.pagination.totalPages || 1,
            totalItems: data?.pagination.total || 0,
            onPageChange: setPage,
          }}
          emptyState={<AdminEmptyState title="No updates" description="No updates match your filters" />}
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

      <UpdateForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        projectId={projectFilter !== 'none' ? projectFilter : undefined}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      <UpdateForm
        open={!!editingUpdate}
        onOpenChange={(open) => !open && setEditingUpdate(null)}
        update={editingUpdate}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Update"
        description="Are you sure you want to delete this update? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Updates"
        description={`Are you sure you want to delete ${selectedIds.length} updates? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
