import { useState, useCallback } from 'react';
import { Navigate } from 'react-router';
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
import { UserEditDialog } from '@/components/admin/forms';
import { useAuth } from '@/lib/auth';
import {
  useAdminUsersList,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
  useDeleteUsersBulk,
} from '@/hooks/admin/use-admin-users';
import type { ApiUser } from '@/types/api';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ASSISTANT_ADMIN', label: 'Assistant Admin' },
  { value: 'BARANGAY', label: 'Barangay' },
  { value: 'CITIZEN', label: 'Citizen' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export function AdminUsersTab() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const { data, isLoading } = useAdminUsersList({
    page,
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy: sortConfig.key as keyof ApiUser,
    sortOrder: sortConfig.direction,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteUser();
  const bulkDeleteMutation = useDeleteUsersBulk();

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

  const handleUpdateRole = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role: role as 'ADMIN' | 'BARANGAY' | 'ASSISTANT_ADMIN' | 'CITIZEN' }, {
      onSuccess: () => {
        toast.success('User role updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user role');
      },
    });
  };

  const handleUpdateStatus = (userId: string, status: string) => {
    updateStatusMutation.mutate({ userId, status: status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' }, {
      onSuccess: () => {
        toast.success('User status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user status');
      },
    });
  };

  const handleDelete = (userId: string) => {
    deleteMutation.mutate(userId, {
      onSuccess: () => {
        toast.success('User deleted successfully');
        setDeleteConfirmId(null);
      },
      onError: () => {
        toast.error('Failed to delete user');
      },
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} users deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete users');
      },
    });
  };

  // Only ADMIN can access users tab - check after all hooks are called
  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const columns = [
    { key: 'name', header: 'Name', accessor: (u: ApiUser) => u.name, sortable: true },
    { key: 'email', header: 'Email', accessor: (u: ApiUser) => u.email },
    { key: 'role', header: 'Role', accessor: (u: ApiUser) => <StatusBadge status={u.role}>{u.role}</StatusBadge> },
    { key: 'status', header: 'Status', accessor: (u: ApiUser) => <StatusBadge status={u.status.toLowerCase() as 'active' | 'inactive' | 'pending' | 'suspended'}>{u.status}</StatusBadge> },
    { key: 'barangayId', header: 'Barangay', accessor: (u: ApiUser) => u.barangay?.name || '-' },
    {
      key: 'actions',
      header: '',
      accessor: (u: ApiUser) => (
        <div className="group">
          <ActionButtons
            onEdit={() => setEditingUser(u)}
            onDelete={() => setDeleteConfirmId(u.id)}
            canDelete={u.id !== currentUser?.id}
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
        searchPlaceholder="Search users by name or email..."
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: ROLE_OPTIONS,
            value: roleFilter,
            onChange: (value) => { setRoleFilter(value); setPage(1); },
          },
          {
            key: 'status',
            label: 'Status',
            options: STATUS_OPTIONS,
            value: statusFilter,
            onChange: (value) => { setStatusFilter(value); setPage(1); },
          },
        ]}
      />

      {data?.data.length === 0 ? (
        <AdminEmptyState
          title="No users found"
          description="There are no users matching your search criteria"
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
          emptyState={<AdminEmptyState title="No users" description="No users match your filters" />}
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

      <UserEditDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onUpdateRole={handleUpdateRole}
        onUpdateStatus={handleUpdateStatus}
        onDelete={(userId) => setDeleteConfirmId(userId)}
        isUpdating={updateRoleMutation.isPending || updateStatusMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Users"
        description={`Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
