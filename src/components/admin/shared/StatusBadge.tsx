import { cn } from '@/lib/utils';

type StatusType =
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'on-hold'
  | 'planned'
  | 'approved-proposal'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'ADMIN'
  | 'ASSISTANT_ADMIN'
  | 'BARANGAY'
  | 'CITIZEN'
  | 'EVENT'
  | 'SAFETY'
  | 'POLICY'
  | 'INFRASTRUCTURE'
  | 'EMERGENCY'
  | 'GOVERNMENT'
  | 'HEALTH'
  | 'EDUCATION'
  | 'ENVIRONMENT'
  | 'BUSINESS'
  | 'WATER'
  | 'ELECTRICITY';

interface StatusBadgeProps {
  status: StatusType | string;
  children?: React.ReactNode;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Project statuses
  ongoing: 'bg-blue-500/10 text-blue-600 border-blue-200',
  completed: 'bg-green-500/10 text-green-600 border-green-200',
  cancelled: 'bg-gray-500/10 text-gray-600 border-gray-200',
  'on-hold': 'bg-amber-500/10 text-amber-600 border-amber-200',
  planned: 'bg-purple-500/10 text-purple-600 border-purple-200',
  'approved-proposal': 'bg-teal-500/10 text-teal-600 border-teal-200',

  // User statuses
  active: 'bg-green-500/10 text-green-600 border-green-200',
  inactive: 'bg-gray-500/10 text-gray-600 border-gray-200',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
  suspended: 'bg-red-500/10 text-red-600 border-red-200',

  // User roles
  ADMIN: 'bg-red-500/10 text-red-600 border-red-200',
  ASSISTANT_ADMIN: 'bg-orange-500/10 text-orange-600 border-orange-200',
  BARANGAY: 'bg-blue-500/10 text-blue-600 border-blue-200',
  CITIZEN: 'bg-green-500/10 text-green-600 border-green-200',

  // Announcement categories
  EVENT: 'bg-purple-500/10 text-purple-600 border-purple-200',
  SAFETY: 'bg-red-500/10 text-red-600 border-red-200',
  POLICY: 'bg-blue-500/10 text-blue-600 border-blue-200',
  INFRASTRUCTURE: 'bg-teal-500/10 text-teal-600 border-teal-200',

  // Contact types
  EMERGENCY: 'bg-red-500/10 text-red-600 border-red-200',
  GOVERNMENT: 'bg-blue-500/10 text-blue-600 border-blue-200',
  HEALTH: 'bg-green-500/10 text-green-600 border-green-200',
  EDUCATION: 'bg-purple-500/10 text-purple-600 border-purple-200',
  ENVIRONMENT: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  BUSINESS: 'bg-amber-500/10 text-amber-600 border-amber-200',
  WATER: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  ELECTRICITY: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

const statusLabels: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'on-hold': 'On Hold',
  planned: 'Planned',
  'approved-proposal': 'Approved Proposal',
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended',
  ADMIN: 'Admin',
  ASSISTANT_ADMIN: 'Assistant Admin',
  BARANGAY: 'Barangay',
  CITIZEN: 'Citizen',
  EVENT: 'Event',
  SAFETY: 'Safety',
  POLICY: 'Policy',
  INFRASTRUCTURE: 'Infrastructure',
  EMERGENCY: 'Emergency',
  GOVERNMENT: 'Government',
  HEALTH: 'Health',
  EDUCATION: 'Education',
  ENVIRONMENT: 'Environment',
  BUSINESS: 'Business',
  WATER: 'Water',
  ELECTRICITY: 'Electricity',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        statusColors[status as string] || 'bg-gray-500/10 text-gray-600 border-gray-200',
        className
      )}
    >
      {children || statusLabels[status as string] || status}
    </span>
  );
}
