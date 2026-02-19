import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn, stripHtml } from '@/lib/utils';
import type { Project } from '@/types';
import { GlassmorphicBadge } from '@/components/badges/GlassmorphicBadge';
import { CircularProgress } from '@/components/visualizations/CircularProgress';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  aspectRatio?: 'portrait' | 'square' | 'landscape';
}

const aspectRatioClasses = {
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  landscape: 'aspect-[16/10]',
};

const GRADIENTS = [
  'bg-gradient-to-br from-coral to-sunshine',
  'bg-gradient-to-br from-electric-blue to-indigo-600',
  'bg-gradient-to-br from-emerald-500 to-teal-700',
  'bg-gradient-to-br from-purple-600 to-pink-500',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-blue-600 to-cyan-500',
];

const getProjectGradient = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
};

export function ProjectCardSkeleton({ aspectRatio = 'portrait' }: { aspectRatio?: 'portrait' | 'square' | 'landscape' }) {
  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl border bg-muted/20', aspectRatioClasses[aspectRatio])}>
      {/* Main Pulse Background */}
      <Skeleton className="h-full w-full rounded-none" />
      
      {/* Top Controls Mimic */}
      <div className="absolute inset-x-3 top-3 flex justify-between items-start">
        {/* Status Badge Placeholder */}
        <Skeleton className="h-7 w-24 rounded-full bg-white/20 backdrop-blur-sm" />
        
        {/* Progress Ring Placeholder */}
        <div className="relative h-12 w-12 rounded-full border-4 border-white/5 flex items-center justify-center">
          <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Content Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gradient-to-t from-black/50 to-transparent">
        {/* Category Badge Placeholder */}
        <Skeleton className="h-5 w-16 rounded-full bg-white/20 backdrop-blur-sm" />
        
        {/* Title Placeholder (2 Lines) */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-[85%] bg-white/30" />
          <Skeleton className="h-6 w-[60%] bg-white/30" />
        </div>

        {/* Footer: Location & Action Pills */}
        <div className="flex items-center justify-between pt-2">
          {/* Location Placeholder */}
          <Skeleton className="h-4 w-28 bg-white/20" />
          
          {/* Stats Pills Placeholder */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-11 rounded-full bg-white/20 backdrop-blur-sm" />
            <Skeleton className="h-8 w-11 rounded-full bg-white/20 backdrop-blur-sm" />
            <Skeleton className="h-8 w-11 rounded-full bg-white/20 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectCard({ project, onClick, aspectRatio = 'portrait' }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/projects/${project.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'masonry-item group relative cursor-pointer overflow-hidden rounded-2xl',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:shadow-2xl',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio])}>
        {project.images && project.images.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.title}
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 ease-out',
              isHovered && 'scale-105'
            )}
            loading="lazy"
          />
        ) : (
          <div className={cn(
            'h-full w-full transition-transform duration-700 ease-out',
            getProjectGradient(project.id),
            isHovered && 'scale-105'
          )}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Sparkles className="size-16 text-white" />
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Badge - Top Left */}
        <div className="absolute left-3 top-3">
          <GlassmorphicBadge status={project.status} />
        </div>

        {/* Progress Ring - Top Right */}
        <div className="absolute right-3 top-3">
          <CircularProgress
            progress={project.progress}
            size={48}
            strokeWidth={4}
            status={project.status}
            animate={isVisible}
          />
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category */}
          <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-200">
            {project.category}
          </span>

          {/* Title */}
          <h3 className="mb-2 text-lg font-bold leading-tight text-white line-clamp-2 group-hover:opacity-0 transition-opacity duration-200">
            {project.title}
          </h3>

          {/* Location & Stats */}
          <div className="flex items-center justify-between group-hover:opacity-0 transition-opacity duration-200">
            <span className="text-sm text-white/70">{project.location}</span>

            {/* Engagement Pills */}
            <div className="flex items-center gap-2">
              {/* Approvals */}
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
                  'bg-green-500/80 backdrop-blur-sm'
                )}
              >
                <ThumbsUp className="h-3.5 w-3.5 text-white" />
                <span className="text-white">{project.approveCount}</span>
              </div>

              {/* Disapprovals */}
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
                  'bg-red-500/80 backdrop-blur-sm'
                )}
              >
                <ThumbsDown className="h-3.5 w-3.5 text-white" />
                <span className="text-white">{project.disapproveCount}</span>
              </div>

              {/* Comments */}
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
                  'bg-black/50 backdrop-blur-sm'
                )}
              >
                <MessageCircle className="h-3.5 w-3.5 text-white" />
                <span className="text-white">{project.comments}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Overlay with Additional Info */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-end bg-black/60 p-4',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <p className="mb-3 text-sm text-white/90 line-clamp-3">
            {stripHtml(project.description)}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/70">
            <span>Budget: {project.budget}</span>
            {project.contractor && (
              <>
                <span>•</span>
                <span>Contractor: {project.contractor}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
