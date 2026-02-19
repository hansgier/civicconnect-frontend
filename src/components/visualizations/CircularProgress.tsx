import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status: ProjectStatus;
  animate?: boolean;
  className?: string;
}

const statusColors: Record<ProjectStatus, string> = {
  ongoing: '#0082f3',
  completed: '#10b981',
  cancelled: '#6b7280',
  'on-hold': '#f97316',
  planned: '#f59e0b',
  'approved-proposal': '#8b5cf6',
};

export function CircularProgress({
  progress,
  size = 48,
  strokeWidth = 4,
  status,
  animate = true,
  className,
}: CircularProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(animate ? 0 : progress);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;
  const color = statusColors[status];

  useEffect(() => {
    if (!animate) return;

    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      
      const currentProgress = startValue + (progress - startValue) * easeOut;
      setAnimatedProgress(currentProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);
  }, [progress, animate]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full backdrop-blur-sm',
        'bg-black/30 transition-transform duration-300 hover:scale-110',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.1s ease-out',
          }}
        />
      </svg>
      
      {/* Percentage text */}
      <span className="absolute text-xs font-bold text-white">
        {Math.round(animatedProgress)}%
      </span>
    </div>
  );
}
