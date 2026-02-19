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
import { ContactForm, type ContactFormData } from '@/components/admin/forms';
import {
  useAdminContactsList,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useDeleteContactsBulk,
} from '@/hooks/admin/use-admin-contacts';
import type { ApiContact } from '@/types/api';

const CONTACT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'WATER', label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
];

const EMERGENCY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'emergency', label: 'Emergency Only' },
  { value: 'normal', label: 'Non-Emergency Only' },
];

export function AdminContactsTab() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [emergencyFilter, setEmergencyFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'title',
    direction: 'asc',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ApiContact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const { data, isLoading } = useAdminContactsList({
    page,
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    isEmergency: emergencyFilter === 'emergency' ? true : emergencyFilter === 'normal' ? false : undefined,
    sortBy: sortConfig.key as keyof ApiContact,
    sortOrder: sortConfig.direction,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  const bulkDeleteMutation = useDeleteContactsBulk();

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

  const handleCreate = (formData: ContactFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Contact created successfully');
        setIsCreateOpen(false);
      },
      onError: () => {
        toast.error('Failed to create contact');
      },
    });
  };

  const handleUpdate = (formData: ContactFormData) => {
    if (!editingContact) return;
    updateMutation.mutate(
      { contactId: editingContact.id, input: formData },
      {
        onSuccess: () => {
          toast.success('Contact updated successfully');
          setEditingContact(null);
        },
        onError: () => {
          toast.error('Failed to update contact');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Contact deleted successfully');
        setDeleteConfirmId(null);
      },
      onError: () => {
        toast.error('Failed to delete contact');
      },
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} contacts deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete contacts');
      },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const columns = [
    { key: 'title', header: 'Name', accessor: (c: ApiContact) => c.title, sortable: true },
    { key: 'type', header: 'Type', accessor: (c: ApiContact) => <StatusBadge status={c.type}>{c.type}</StatusBadge> },
    { key: 'phone', header: 'Phone', accessor: (c: ApiContact) => c.phoneNumbers[0] || c.primaryPhone || '-' },
    { key: 'email', header: 'Email', accessor: (c: ApiContact) => c.emails[0] || '-' },
    {
      key: 'actions',
      header: '',
      accessor: (c: ApiContact) => (
        <div className="group">
          <ActionButtons
            onEdit={() => setEditingContact(c)}
            onDelete={() => setDeleteConfirmId(c.id)}
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
        searchPlaceholder="Search contacts..."
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: CONTACT_TYPES,
            value: typeFilter,
            onChange: (value) => { setTypeFilter(value); setPage(1); },
          },
          {
            key: 'emergency',
            label: 'Emergency',
            options: EMERGENCY_OPTIONS,
            value: emergencyFilter,
            onChange: (value) => { setEmergencyFilter(value); setPage(1); },
          },
        ]}
        onAddNew={() => setIsCreateOpen(true)}
        addNewLabel="Add Contact"
      />

      {data?.data.length === 0 ? (
        <AdminEmptyState
          title="No contacts found"
          description="Get started by creating a new contact"
          actionLabel="Add Contact"
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
          getRowId={(c) => c.id}
          pagination={{
            page: page,
            totalPages: data?.pagination.totalPages || 1,
            totalItems: data?.pagination.total || 0,
            onPageChange: setPage,
          }}
          emptyState={<AdminEmptyState title="No contacts" description="No contacts match your filters" />}
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

      <ContactForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      <ContactForm
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
        contact={editingContact}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Contacts"
        description={`Are you sure you want to delete ${selectedIds.length} contacts? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
