// Admin hooks shared types

import type { ApiPagination } from '@/types/api';

// ============================================================
// Common Admin Types
// ============================================================

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminListResponse<T> {
  data: T[];
  pagination: ApiPagination;
}

export interface BulkDeleteResponse {
  success: boolean;
  deletedCount: number;
  message?: string;
}

export interface BulkDeleteParams {
  ids: string[];
}

export interface NestedBulkDeleteParams {
  items: Array<{ id: string; projectId: string }>;
}

// ============================================================
// Project Admin Types
// ============================================================

export interface AdminProjectFilters extends AdminListParams {
  status?: string;
  category?: string;
  barangayId?: string;
  fundingSourceId?: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  cost?: number | string;
  startDate?: string;
  dueDate?: string;
  status: string;
  category?: string;
  implementingAgency?: string;
  contractor?: string;
  barangayIds: string[];
  fundingSourceId?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

// ============================================================
// Announcement Admin Types
// ============================================================

export interface AdminAnnouncementFilters extends AdminListParams {
  category?: string;
  isUrgent?: boolean;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  category?: string;
  isUrgent?: boolean;
  location?: string;
}

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>;

// ============================================================
// Contact Admin Types
// ============================================================

export interface AdminContactFilters extends AdminListParams {
  type?: string;
  isEmergency?: boolean;
}

export interface CreateContactInput {
  title: string;
  description?: string;
  phoneNumbers: string[];
  primaryPhone?: string;
  emails: string[];
  schedule?: string;
  location?: string;
  type: string;
  isEmergency?: boolean;
  order?: number;
}

export type UpdateContactInput = Partial<CreateContactInput>;

// ============================================================
// User Admin Types
// ============================================================

export interface AdminUserFilters extends AdminListParams {
  role?: string;
  status?: string;
  barangayId?: string;
}

export interface UpdateUserRoleInput {
  userId: string;
  role: 'ADMIN' | 'BARANGAY' | 'ASSISTANT_ADMIN' | 'CITIZEN';
}

export interface UpdateUserStatusInput {
  userId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
}

// ============================================================
// Comment Admin Types
// ============================================================

export interface AdminCommentFilters extends AdminListParams {
  projectId?: string;
  isOfficial?: boolean;
  userId?: string;
}

export interface UpdateCommentInput {
  commentId: string;
  content: string;
}

export interface MarkCommentOfficialInput {
  commentId: string;
  isOfficial: boolean;
}

// ============================================================
// Update Admin Types
// ============================================================

export interface AdminUpdateFilters extends AdminListParams {
  projectId?: string;
}

export interface CreateUpdateInput {
  projectId: string;
  title: string;
  description?: string;
  date?: string;
}

export interface UpdateUpdateInput {
  updateId: string;
  projectId: string;
  title?: string;
  description?: string;
  date?: string;
}
