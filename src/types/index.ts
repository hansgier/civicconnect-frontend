export type ProjectStatus = 'ongoing' | 'completed' | 'cancelled' | 'on-hold' | 'planned' | 'approved-proposal';

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: ProjectStatus;
  progress: number;
  category: string;
  location: string;
  budget: string;
  timeline: string;
  approveCount: number;
  disapproveCount: number;
  comments: number;
  createdAt: string;
  endedAt?: string;
  contractor?: string;
  contractTerm?: string;
  implementingAgency?: string;
  updates: ProjectUpdate[];
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  date?: string;
  author?: User;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  userHasLiked: boolean;
  replies: Comment[];
  isOfficial: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  contributions: number;
  joinedAt: string;
  userType?: 'admin' | 'assistant-admin' | 'barangay' | 'resident';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
}

export interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  isUrgent: boolean;
  createdAt: string;
  author: User;
  location?: string;
}

export interface Contact {
  id: string;
  title: string;
  description: string;
  phoneNumbers: string[];
  primaryPhone: string;
  emails: string[];
  schedule?: string;
  location?: string;
  type: ContactType;
  isEmergency: boolean;
  order?: number;
}

export type ContactType = 
  | 'emergency' 
  | 'government' 
  | 'health' 
  | 'education' 
  | 'environment' 
  | 'business' 
  | 'water' 
  | 'electricity';

export interface Notification {
  id: string;
  type: 'approval' | 'comment' | 'update' | 'announcement' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  projectId?: string;
  announcementId?: string;
}

export type Category = 'All' | 'Institutional' | 'Transportation' | 'Health' | 'Water' | 'Education' | 'Social' | 'Infrastructure' | 'Sports and Recreation' | 'Economic';

export type SortOption = 'newest' | 'oldest' | 'most-approved' | 'least-approved' | 'budget-high' | 'budget-low';

export type AnnouncementSortOption = 'newest' | 'oldest';

export type CommentSortOption = 'relevant' | 'top' | 'oldest' | 'latest';

export type ContactSortOption = 'name-asc' | 'name-desc';

export interface ProjectFilters {
  category: string;
  location: string;
  status: ProjectStatus | 'all';
  budgetRange: string;
  dateFrom: string;
  dateTo: string;
}

export interface AnnouncementFilters {
  category: string;
  location: string;
  isUrgent: boolean | null;
  dateFrom: string;
  dateTo: string;
}

export interface ContactFilters {
  type: string;
  search: string;
}
