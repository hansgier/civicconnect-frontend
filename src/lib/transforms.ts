import type {
  ApiProjectListItem,
  ApiProjectDetail,
  ApiProjectUpdate,
  ApiComment,
  ApiAnnouncement,
  ApiNotification,
  ApiContact,
  ApiUserRole,
  ApiContactType,
} from '@/types/api';
import type {
  Project,
  ProjectUpdate,
  Comment,
  User,
  Announcement,
  Notification,
  Contact,
  ContactType,
} from '@/types';

// ============================================================
// Helpers
// ============================================================

/**
 * Format a Decimal string (e.g., "5200000.00") to display format (e.g., "PHP 5.2M")
 */
export function formatCost(cost: string | null): string {
  if (!cost) return 'TBD';
  const num = parseFloat(cost);
  if (isNaN(num)) return 'TBD';
  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    return `PHP ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const thousands = num / 1_000;
    return `PHP ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  return `PHP ${num.toLocaleString()}`;
}

/**
 * Format a date range string from startDate and dueDate
 */
export function formatTimeline(startDate: string | null, dueDate: string | null): string {
  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (startDate && dueDate) return `${formatDate(startDate)} - ${formatDate(dueDate)}`;
  if (startDate) return `${formatDate(startDate)} - Present`;
  if (dueDate) return `Until ${formatDate(dueDate)}`;
  return 'TBD';
}

/**
 * Map backend ProjectStatus enum to frontend lowercase-hyphenated format
 */
export function mapProjectStatus(status: string): Project['status'] {
  const map: Record<string, Project['status']> = {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ON_HOLD: 'on-hold',
    PLANNED: 'planned',
    APPROVED_PROPOSAL: 'approved-proposal',
  };
  return map[status] || 'planned';
}

/**
 * Map backend ProjectCategory enum to display string
 */
export function mapProjectCategory(category: string | null): string {
  if (!category) return 'Uncategorized';
  const map: Record<string, string> = {
    INSTITUTIONAL: 'Institutional',
    TRANSPORTATION: 'Transportation',
    HEALTH: 'Health',
    WATER: 'Water',
    EDUCATION: 'Education',
    SOCIAL: 'Social',
    INFRASTRUCTURE: 'Infrastructure',
    SPORTS_AND_RECREATION: 'Sports and Recreation',
    ECONOMIC: 'Economic',
  };
  return map[category] || category;
}

/**
 * Map backend UserRole to frontend userType
 */
export function mapUserRole(role: ApiUserRole): User['userType'] {
  const map: Record<ApiUserRole, User['userType']> = {
    ADMIN: 'admin',
    BARANGAY: 'barangay',
    ASSISTANT_ADMIN: 'assistant-admin',
    CITIZEN: 'resident',
  };
  return map[role];
}

/**
 * Map backend ContactType to frontend lowercase format
 */
export function mapContactType(type: ApiContactType | string): ContactType {
  return type.toLowerCase() as ContactType;
}

/**
 * Map backend AnnouncementCategory to display string
 */
export function mapAnnouncementCategory(category: string | null): string {
  if (!category) return 'General';
  const map: Record<string, string> = {
    EVENT: 'Event',
    SAFETY: 'Safety',
    POLICY: 'Policy',
    INFRASTRUCTURE: 'Infrastructure',
  };
  return map[category] || category;
}

/**
 * Compute progress percentage from project status and dates
 */
export function computeProgress(
  status: string,
  startDate: string | null,
  dueDate: string | null
): number {
  if (status === 'COMPLETED') return 100;
  if (status === 'CANCELLED') return 0;
  if (status === 'PLANNED' || status === 'APPROVED_PROPOSAL') return 0;
  if (status === 'ON_HOLD') return 0;

  // ONGOING: estimate based on time elapsed
  if (status === 'ONGOING' && startDate && dueDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(dueDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 95; // Overdue but not complete
    return Math.round(((now - start) / (end - start)) * 100);
  }

  return 0;
}

const DEFAULT_AVATAR = '/default-avatar.png';

// ============================================================
// Transform Functions
// ============================================================

/**
 * Transform a minimal user object from API (comment author, project creator)
 * into the frontend User shape.
 */
export function transformUser(
  apiUser: { id: string; name: string; avatar?: string | null; role?: string; status?: string },
  extras?: { email?: string; createdAt?: string; contributions?: number }
): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    avatar: apiUser.avatar || DEFAULT_AVATAR,
    email: extras?.email,
    contributions: extras?.contributions ?? 0,
    joinedAt: extras?.createdAt || '',
    userType: apiUser.role ? mapUserRole(apiUser.role as ApiUserRole) : 'resident',
    status: (apiUser.status as User['status']) || 'ACTIVE',
  };
}

/**
 * Transform a project update from API to frontend shape.
 */
export function transformProjectUpdate(apiUpdate: ApiProjectUpdate): ProjectUpdate {
  return {
    id: apiUpdate.id,
    title: apiUpdate.title,
    content: apiUpdate.description || '',
    createdAt: apiUpdate.createdAt,
    date: apiUpdate.date || apiUpdate.createdAt,
  };
}

/**
 * Transform a project list item from API to frontend shape.
 */
export function transformProjectListItem(api: ApiProjectListItem): Project {
  return {
    id: api.id,
    title: api.title,
    description: api.description || '',
    images: api.media?.map(m => m.url) || [],
    status: mapProjectStatus(api.status),
    progress: computeProgress(api.status, api.startDate, api.dueDate),
    category: mapProjectCategory(api.category),
    location: api.barangays.map((b) => b.barangay.name).join(', ') || 'Citywide',
    budget: formatCost(api.cost),
    timeline: formatTimeline(api.startDate, api.dueDate),
    approveCount: api.approveCount,
    disapproveCount: api.disapproveCount,
    comments: api._count.comments,
    createdAt: api.createdAt,
    endedAt: api.completionDate || undefined,
    contractor: api.contractor || undefined,
    implementingAgency: api.implementingAgency || undefined,
    updates: [],
  };
}

/**
 * Transform a full project detail from API to frontend shape.
 */
export function transformProjectDetail(api: ApiProjectDetail): Project {
  return {
    id: api.id,
    title: api.title,
    description: api.description || '',
    images: api.media
      .filter((m) => m.type === 'IMAGE')
      .map((m) => m.url),
    status: mapProjectStatus(api.status),
    progress: computeProgress(api.status, api.startDate, api.dueDate),
    category: mapProjectCategory(api.category),
    location: api.barangays.map((b) => b.barangay.name).join(', ') || 'Citywide',
    budget: formatCost(api.cost),
    timeline: formatTimeline(api.startDate, api.dueDate),
    approveCount: api.approveCount,
    disapproveCount: api.disapproveCount,
    comments: api.comments.length,
    createdAt: api.createdAt,
    endedAt: api.completionDate || undefined,
    contractor: api.contractor || undefined,
    implementingAgency: api.implementingAgency || undefined,
    updates: api.updates.map(transformProjectUpdate),
  };
}

/**
 * Transform a comment from API to frontend shape (recursive for replies).
 */
export function transformComment(api: ApiComment): Comment {
  return {
    id: api.id,
    author: transformUser(api.user),
    content: api.content,
    createdAt: api.createdAt,
    likes: api.likes ?? api._count?.reactions ?? 0,
    userHasLiked: api.userHasLiked || false,
    replies: (api.replies || []).map(transformComment),
    isOfficial: !!api.isOfficial,
  };
}

/**
 * Transform an announcement from API to frontend shape.
 */
export function transformAnnouncement(api: ApiAnnouncement): Announcement {
  return {
    id: api.id,
    title: api.title,
    excerpt: api.excerpt || api.content.substring(0, 150) + '...',
    content: api.content,
    image: api.image || '',
    category: mapAnnouncementCategory(api.category),
    isUrgent: api.isUrgent,
    createdAt: api.createdAt,
    author: transformUser(api.author),
    location: api.location || undefined,
  };
}

/**
 * Transform a notification from API to frontend shape.
 */
export function transformNotification(api: ApiNotification): Notification {
  return {
    id: api.id,
    type: api.type.toLowerCase() as Notification['type'],
    title: api.title,
    message: api.description,
    createdAt: api.createdAt,
    read: api.read,
    projectId: api.projectId || undefined,
    announcementId: api.announcementId || undefined,
  };
}

/**
 * Transform a contact from API to frontend shape.
 */
export function transformContact(api: ApiContact): Contact {
  return {
    id: api.id,
    title: api.title,
    description: api.description || '',
    phoneNumbers: api.phoneNumbers,
    primaryPhone: api.primaryPhone || api.phoneNumbers[0] || '',
    emails: api.emails,
    schedule: api.schedule || undefined,
    location: api.location || undefined,
    type: mapContactType(api.type),
    isEmergency: api.isEmergency,
    order: api.order ?? undefined,
  };
}
