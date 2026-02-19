import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AdminDataTable,
  BulkActionBar,
  ConfirmDialog,
  StatusBadge,
  SearchFilterBar,
  ActionButtons,
  AdminEmptyState,
  LoadingSkeleton,
} from '@/components/admin/shared';
import { AnnouncementForm, type AnnouncementFormData } from '@/components/admin/forms';
import {
  useAdminAnnouncementsList,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useDeleteAnnouncementsBulk,
} from '@/hooks/admin/use-admin-announcements';
import type { ApiAnnouncement } from '@/types/api';

const ANNOUNCEMENT_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'EVENT', label: 'Event' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'POLICY', label: 'Policy' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
];

const URGENT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent Only' },
  { value: 'normal', label: 'Normal Only' },
];

export function AdminAnnouncementsTab() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgentFilter, setUrgentFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ApiAnnouncement | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const { data, isLoading } = useAdminAnnouncementsList({
    page,
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    isUrgent: urgentFilter === 'urgent' ? true : urgentFilter === 'normal' ? false : undefined,
    sortBy: sortConfig.key as keyof ApiAnnouncement,
    sortOrder: sortConfig.direction,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const bulkDeleteMutation = useDeleteAnnouncementsBulk();

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    const allIds = data.data.map((a) => a.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  }, [data, selectedIds]);

  const handleCreate = (formData: AnnouncementFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Announcement created successfully');
        setIsCreateOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create announcement');
      },
    });
  };

  const handleUpdate = (formData: AnnouncementFormData) => {
    if (!editingAnnouncement) return;
    updateMutation.mutate(
      { announcementId: editingAnnouncement.id, input: formData },
      {
        onSuccess: () => {
          toast.success('Announcement updated successfully');
          setEditingAnnouncement(null);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update announcement');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Announcement deleted successfully');
        setDeleteConfirmId(null);
      },
      onError: () => {
        toast.error('Failed to delete announcement');
      },
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} announcements deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete announcements');
      },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const columns = [
    { key: 'title', header: 'Title', accessor: (a: ApiAnnouncement) => a.title, sortable: true },
    { key: 'category', header: 'Category', accessor: (a: ApiAnnouncement) => a.category ? <StatusBadge status={a.category}>{a.category}</StatusBadge> : '-' },
    { key: 'isUrgent', header: 'Urgent', accessor: (a: ApiAnnouncement) => a.isUrgent ? <StatusBadge status='suspended'>Urgent</StatusBadge> : '-' },
    { key: 'createdAt', header: 'Date', accessor: (a: ApiAnnouncement) => new Date(a.createdAt).toLocaleDateString(), sortable: true },
    {
      key: 'actions',
      header: '',
      accessor: (a: ApiAnnouncement) => (
        <div className="group">
          <ActionButtons
            onEdit={() => setEditingAnnouncement(a)}
            onDelete={() => setDeleteConfirmId(a.id)}
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
        searchPlaceholder="Search announcements..."
        filters={[
          {
            key: 'category',
            label: 'Category',
            options: ANNOUNCEMENT_CATEGORIES,
            value: categoryFilter,
            onChange: (value) => { setCategoryFilter(value); setPage(1); },
          },
          {
            key: 'urgent',
            label: 'Urgency',
            options: URGENT_OPTIONS,
            value: urgentFilter,
            onChange: (value) => { setUrgentFilter(value); setPage(1); },
          },
        ]}
        onAddNew={() => setIsCreateOpen(true)}
        addNewLabel="Add Announcement"
      />

      {data?.data.length === 0 ? (
        <AdminEmptyState
          title="No announcements found"
          description="Get started by creating a new announcement"
          actionLabel="Add Announcement"
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
          getRowId={(a) => a.id}
          pagination={{
            page: page,
            totalPages: data?.pagination.totalPages || 1,
            totalItems: data?.pagination.total || 0,
            onPageChange: setPage,
          }}
          emptyState={<AdminEmptyState title="No announcements" description="No announcements match your filters" />}
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

      <AnnouncementForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      <AnnouncementForm
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && setEditingAnnouncement(null)}
        announcement={editingAnnouncement}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Announcements"
        description={`Are you sure you want to delete ${selectedIds.length} announcements? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
