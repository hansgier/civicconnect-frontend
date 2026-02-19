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
import { ProjectForm, type ProjectFormData } from '@/components/admin/forms';
import {
  useAdminProject,
  useAdminProjectsList,
  useCreateProject,
  useUpdateProject,
  useUpdateProjectMedia,
  useDeleteProject,
  useDeleteProjectsBulk,
} from '@/hooks/admin/use-admin-projects';
import type { ApiProjectListItem } from '@/types/api';

const PROJECT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'PLANNED', label: 'Planned' },
];

const PROJECT_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'INSTITUTIONAL', label: 'Institutional' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'WATER', label: 'Water' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SPORTS_AND_RECREATION', label: 'Sports & Rec' },
  { value: 'ECONOMIC', label: 'Economic' },
];

export function AdminProjectsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ApiProjectListItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Fetch full project details when editing
  const { data: fullEditingProject } = useAdminProject(editingProject?.id || '');

  const { data, isLoading } = useAdminProjectsList({
    page,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    sortBy: sortConfig.key as keyof ApiProjectListItem,
    sortOrder: sortConfig.direction,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const mediaMutation = useUpdateProjectMedia();
  const deleteMutation = useDeleteProject();
  const bulkDeleteMutation = useDeleteProjectsBulk();

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    const allIds = data.data.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  }, [data, selectedIds]);

  const handleCreate = (formData: ProjectFormData, media: { newFiles: File[], deletedIds: string[] }) => {
    createMutation.mutate(formData, {
      onSuccess: (response: { project: ApiProjectListItem }) => {
        const projectId = response.project.id;
        
        // Handle media upload if there are files
        if (media.newFiles.length > 0) {
          mediaMutation.mutate({ 
            projectId, 
            files: media.newFiles, 
            deleteMediaIds: [] 
          }, {
            onSuccess: () => {
              toast.success('Project created with media');
              setIsCreateOpen(false);
            },
            onError: () => {
              toast.error('Project created, but media upload failed');
              setIsCreateOpen(false);
            }
          });
        } else {
          toast.success('Project created successfully');
          setIsCreateOpen(false);
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create project');
      },
    });
  };

  const handleUpdate = (formData: ProjectFormData, media: { newFiles: File[], deletedIds: string[] }) => {
    if (!editingProject) return;
    
    updateMutation.mutate(
      { projectId: editingProject.id, input: formData },
      {
        onSuccess: () => {
          // Handle media updates (new uploads or deletions)
          if (media.newFiles.length > 0 || media.deletedIds.length > 0) {
            mediaMutation.mutate({ 
              projectId: editingProject.id, 
              files: media.newFiles, 
              deleteMediaIds: media.deletedIds 
            }, {
              onSuccess: () => {
                toast.success('Project and media updated');
                setEditingProject(null);
              },
              onError: () => {
                toast.error('Project updated, but media changes failed');
                setEditingProject(null);
              }
            });
          } else {
            toast.success('Project updated successfully');
            setEditingProject(null);
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update project');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Project deleted successfully');
        setDeleteConfirmId(null);
      },
      onError: () => {
        toast.error('Failed to delete project');
      },
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`${selectedIds.length} projects deleted successfully`);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      },
      onError: () => {
        toast.error('Failed to delete projects');
      },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const columns = [
    { key: 'title', header: 'Title', accessor: (p: ApiProjectListItem) => p.title, sortable: true },
    { key: 'status', header: 'Status', accessor: (p: ApiProjectListItem) => <StatusBadge status={p.status.toLowerCase() as 'ongoing' | 'completed' | 'cancelled' | 'on-hold' | 'planned' | 'approved-proposal'} /> },
    { key: 'category', header: 'Category', accessor: (p: ApiProjectListItem) => p.category || '-' },
    { key: 'location', header: 'Location', accessor: (p: ApiProjectListItem) => p.barangays?.map((b) => b.barangay.name).join(', ') || '-' },
    { key: 'cost', header: 'Budget', accessor: (p: ApiProjectListItem) => p.cost ? `₱${parseFloat(p.cost).toLocaleString()}` : '-', sortable: true },
    {
      key: 'actions',
      header: '',
      accessor: (p: ApiProjectListItem) => (
        <div className="group">
          <ActionButtons
            onEdit={() => setEditingProject(p)}
            onDelete={() => setDeleteConfirmId(p.id)}
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
        searchPlaceholder="Search projects..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: PROJECT_STATUSES,
            value: statusFilter,
            onChange: (value) => { setStatusFilter(value); setPage(1); },
          },
          {
            key: 'category',
            label: 'Category',
            options: PROJECT_CATEGORIES,
            value: categoryFilter,
            onChange: (value) => { setCategoryFilter(value); setPage(1); },
          },
        ]}
        onAddNew={() => setIsCreateOpen(true)}
        addNewLabel="Add Project"
      />

      {data?.data.length === 0 ? (
        <AdminEmptyState
          title="No projects found"
          description="Get started by creating a new project"
          actionLabel="Add Project"
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
          getRowId={(p) => p.id}
          pagination={{
            page: data?.pagination.page || 1,
            totalPages: data?.pagination.totalPages || 1,
            totalItems: data?.pagination.total || 0,
            onPageChange: setPage,
          }}
          emptyState={<AdminEmptyState title="No projects" description="No projects match your filters" />}
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

      <ProjectForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending || mediaMutation.isPending}
      />

      <ProjectForm
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        project={fullEditingProject || editingProject}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending || mediaMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Projects"
        description={`Are you sure you want to delete ${selectedIds.length} projects? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
