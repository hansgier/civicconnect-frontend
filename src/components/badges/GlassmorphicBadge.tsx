import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types';
import { Clock, Loader2, CheckCircle2, FileCheck, PauseCircle, XCircle } from 'lucide-react';

interface GlassmorphicBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; bgColor: string }> = {
  ongoing:             { label: 'Ongoing',           icon: Loader2,      bgColor: 'bg-blue-500/80' },
  completed:           { label: 'Completed',         icon: CheckCircle2, bgColor: 'bg-green-500/80' },
  cancelled:           { label: 'Cancelled',         icon: XCircle,      bgColor: 'bg-red-500/80' },
  'on-hold':           { label: 'On Hold',           icon: PauseCircle,  bgColor: 'bg-orange-500/80' },
  planned:             { label: 'Planned',           icon: Clock,        bgColor: 'bg-amber-500/80' },
  'approved-proposal': { label: 'Approved Proposal', icon: FileCheck,    bgColor: 'bg-purple-500/80' },
};

export function GlassmorphicBadge({ status, className }: GlassmorphicBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5',
        'backdrop-blur-md transition-all duration-300',
        'border border-white/20',
        config.bgColor,
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Icon */}
      <Icon className={cn(
        'relative h-3.5 w-3.5 text-white',
        status === 'ongoing' && 'animate-spin'
      )} />
      
      {/* Label */}
      <span className="relative text-xs font-semibold text-white">
        {config.label}
      </span>
    </div>
  );
}
