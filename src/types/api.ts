// ============================================================
// Enums (matching backend Prisma enums)
// ============================================================

export type ApiUserRole = 'ADMIN' | 'BARANGAY' | 'ASSISTANT_ADMIN' | 'CITIZEN';
export type ApiUserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
export type ApiProjectStatus = 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'PLANNED' | 'APPROVED_PROPOSAL';
export type ApiProjectCategory =
  | 'INSTITUTIONAL' | 'TRANSPORTATION' | 'HEALTH' | 'WATER'
  | 'EDUCATION' | 'SOCIAL' | 'INFRASTRUCTURE'
  | 'SPORTS_AND_RECREATION' | 'ECONOMIC';
export type ApiReactionType = 'LIKE' | 'DISLIKE';
export type ApiMediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type ApiAnnouncementCategory = 'EVENT' | 'SAFETY' | 'POLICY' | 'INFRASTRUCTURE';
export type ApiNotificationType = 'APPROVAL' | 'COMMENT' | 'UPDATE' | 'ANNOUNCEMENT' | 'SYSTEM';
export type ApiContactType =
  | 'EMERGENCY' | 'GOVERNMENT' | 'HEALTH' | 'EDUCATION'
  | 'ENVIRONMENT' | 'BUSINESS' | 'WATER' | 'ELECTRICITY';

// ============================================================
// Shared
// ============================================================

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================
// Auth
// ============================================================

export interface ApiAuthUser {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  status: ApiUserStatus;
  barangayId: string | null;
  emailVerified: boolean;
  avatar: string | null;
  createdAt?: string;
}

export interface ApiLoginResponse {
  user: ApiAuthUser;
}

export interface ApiMeResponse {
  user: ApiAuthUser;
}

// ============================================================
// Users
// ============================================================

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  status: ApiUserStatus;
  barangayId: string | null;
  avatar: string | null;
  emailVerified: boolean;
  googleId?: string | null;
  facebookId?: string | null;
  createdAt: string;
  updatedAt: string;
  barangay?: { id: string; name: string } | null;
}

export interface ApiUserListResponse {
  users: ApiUser[];
  pagination: ApiPagination;
}

export interface ApiUserResponse {
  user: ApiUser;
}

export interface ApiUserStats {
  projectsFollowed: number;
  totalApprovals: number;
  totalComments: number;
}

export interface ApiUserActivity {
  id: string;
  type: 'approved' | 'disapproved' | 'commented';
  projectId: string;
  projectTitle: string;
  content?: string;
  createdAt: string;
}

export interface ApiUserComment {
  id: string;
  content: string;
  userId: string;
  projectId: string;
  parentId: string | null;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
  project: { id: string; title: string };
  _count: { reactions: number; replies: number };
  likes: number;
}

// ============================================================
// Projects
// ============================================================

export interface ApiProjectListItem {
  id: string;
  title: string;
  description: string | null;
  cost: string | null; // Decimal comes as string
  startDate: string | null;
  dueDate: string | null;
  completionDate: string | null;
  status: ApiProjectStatus;
  category: ApiProjectCategory | null;
  implementingAgency: string | null;
  contractor: string | null;
  createdById: string;
  fundingSourceId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; role: string; avatar: string | null };
  barangays: Array<{
    projectId: string;
    barangayId: string;
    barangay: { id: string; name: string };
  }>;
  fundingSource: { id: string; name: string } | null;
  approveCount: number;
  disapproveCount: number;
  media?: ApiMedia[];
  _count: { comments: number; reactions: number; media: number };
}

export interface ApiProjectDetail extends Omit<ApiProjectListItem, '_count'> {
  comments: ApiComment[];
  media: ApiMedia[];
  updates: ApiProjectUpdate[];
  approveCount: number;
  disapproveCount: number;
  barangays: Array<{
    projectId: string;
    barangayId: string;
    barangay: { id: string; name: string; district?: string };
  }>;
}

export interface ApiProjectListResponse {
  projects: ApiProjectListItem[];
  pagination: ApiPagination;
}

export interface ApiProjectDetailResponse {
  project: ApiProjectDetail;
}

export interface ApiProjectUpdate {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Comments
// ============================================================

export interface ApiComment {
  id: string;
  content: string;
  userId: string;
  projectId: string;
  parentId: string | null;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatar: string | null; role?: ApiUserRole };
  replies?: ApiComment[];
  _count?: { reactions: number; replies: number };
  likes?: number;
  userHasLiked?: boolean;
}

export interface ApiCommentListResponse {
  comments: ApiComment[];
}

export interface ApiCommentCreateResponse {
  success: boolean;
  data: ApiComment;
}

// ============================================================
// Reactions
// ============================================================

export interface ApiReactionsResponse {
  likes: number;
  dislikes: number;
  userReactions: Array<{
    userId: string;
    type: ApiReactionType;
    reactionId: string;
  }>;
}

export interface ApiReaction {
  id: string;
  type: ApiReactionType;
  userId: string;
  projectId: string | null;
  commentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Announcements
// ============================================================

export interface ApiAnnouncement {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  category: ApiAnnouncementCategory | null;
  isUrgent: boolean;
  location: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; role: ApiUserRole; avatar: string | null };
}

export interface ApiAnnouncementListResponse {
  announcements: ApiAnnouncement[];
  pagination: ApiPagination;
}

export interface ApiAnnouncementDetailResponse {
  announcement: ApiAnnouncement;
}

// ============================================================
// Notifications
// ============================================================

export interface ApiNotification {
  id: string;
  title: string;
  description: string;
  type: ApiNotificationType;
  read: boolean;
  userId: string;
  projectId: string | null;
  announcementId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotificationListResponse {
  success: boolean;
  data: ApiNotification[];
  meta: ApiPaginationMeta;
}

export interface ApiUnreadCountResponse {
  success: boolean;
  data: { count: number };
}

// ============================================================
// Dashboard
// ============================================================

export interface ApiDashboardStats {
  cityPopulation: number;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  cancelledProjects: number;
  plannedProjects: number;
  onHoldProjects: number;
  approvedProposalProjects: number;
  statusDistribution: Record<string, number>;
}

export interface ApiTrendData {
  trends: Array<{ month: string; count: number }>;
  percentChange: number;
}

export interface ApiTopProject {
  id: string;
  title: string;
  status: string;
  category: string | null;
  approveCount: number;
  commentCount: number;
  score: number;
}

export interface ApiWorstProject {
  id: string;
  title: string;
  status: string;
  category: string | null;
  disapproveCount: number;
}

export interface ApiStatusTrendData {
  month: string;
  ongoing: number;
  completed: number;
  planned: number;
  approved_proposal: number;
  on_hold: number;
  cancelled: number;
}

// ============================================================
// Contacts
// ============================================================

export interface ApiContact {
  id: string;
  title: string;
  description: string | null;
  phoneNumbers: string[];
  primaryPhone: string | null;
  emails: string[];
  schedule: string | null;
  location: string | null;
  type: ApiContactType;
  isEmergency: boolean;
  order: number | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; avatar: string | null };
}

export interface ApiContactListResponse {
  contacts: ApiContact[];
  pagination: ApiPagination;
}

// ============================================================
// Media
// ============================================================

export interface ApiMedia {
  id: string;
  url: string;
  publicId: string;
  type: ApiMediaType;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Barangays
// ============================================================

export interface ApiBarangay {
  id: string;
  name: string;
  district: string | null;
  population: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number; projects: number };
}

export interface ApiBarangayListResponse {
  barangays: ApiBarangay[];
  pagination: ApiPagination;
}

// ============================================================
// Funding Sources
// ============================================================

export interface ApiFundingSource {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
}
