import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useReactions, useToggleReaction } from '@/hooks/use-reactions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ApprovalButtonsProps {
  projectId: string;
  approveCount: number;
  disapproveCount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ApprovalButtons({
  projectId,
  approveCount: initialApprove,
  disapproveCount: initialDisapprove,
  size = 'md',
}: ApprovalButtonsProps) {
  const { user, isAuthenticated, isGuest } = useAuth();
  const { data: reactionsData, isLoading } = useReactions(projectId);
  const toggleReaction = useToggleReaction(projectId);

  const sizeClasses = {
    sm: { button: 'h-8 px-3 text-xs', icon: 'h-3.5 w-3.5' },
    md: { button: 'h-10 px-4 text-sm', icon: 'h-4 w-4' },
    lg: { button: 'h-12 px-6 text-base', icon: 'h-5 w-5' },
  };

  const userReaction = reactionsData?.userReactions.find(
    (r) => r.userId === user?.id
  );

  const approveCount = reactionsData?.likes ?? initialApprove;
  const disapproveCount = reactionsData?.dislikes ?? initialDisapprove;

  const handleToggle = (type: 'LIKE' | 'DISLIKE') => {
    if (!isAuthenticated || isGuest) return;
    toggleReaction.mutate(type);
  };

  const renderButtons = () => (
    <div className="flex items-center gap-3">
      {/* Approve Button */}
      <Button
        onClick={() => handleToggle('LIKE')}
        disabled={!isAuthenticated || isGuest || toggleReaction.isPending || isLoading}
        variant={userReaction?.type === 'LIKE' ? 'default' : 'outline'}
        className={cn(
          'gap-2 transition-all duration-300',
          sizeClasses[size].button,
          userReaction?.type === 'LIKE' && 'bg-green-500 hover:bg-green-600 text-white border-green-500'
        )}
      >
        {toggleReaction.isPending && toggleReaction.variables === 'LIKE' ? (
          <Loader2 className={cn(sizeClasses[size].icon, 'animate-spin')} />
        ) : (
          <ThumbsUp
            className={cn(
              sizeClasses[size].icon,
              'transition-transform duration-300',
              userReaction?.type === 'LIKE' && 'scale-110'
            )}
          />
        )}
        <span>{approveCount.toLocaleString()}</span>
        <span className="hidden sm:inline">Approve</span>
      </Button>

      {/* Disapprove Button */}
      <Button
        onClick={() => handleToggle('DISLIKE')}
        disabled={!isAuthenticated || isGuest || toggleReaction.isPending || isLoading}
        variant={userReaction?.type === 'DISLIKE' ? 'default' : 'outline'}
        className={cn(
          'gap-2 transition-all duration-300',
          sizeClasses[size].button,
          userReaction?.type === 'DISLIKE' && 'bg-red-500 hover:bg-red-600 text-white border-red-500'
        )}
      >
        {toggleReaction.isPending && toggleReaction.variables === 'DISLIKE' ? (
          <Loader2 className={cn(sizeClasses[size].icon, 'animate-spin')} />
        ) : (
          <ThumbsDown
            className={cn(
              sizeClasses[size].icon,
              'transition-transform duration-300',
              userReaction?.type === 'DISLIKE' && 'scale-110'
            )}
          />
        )}
        <span>{disapproveCount.toLocaleString()}</span>
        <span className="hidden sm:inline">Disapprove</span>
      </Button>
    </div>
  );

  if (!isAuthenticated || isGuest) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">{renderButtons()}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isGuest ? 'Sign in to cast your vote' : 'Login to cast your vote'}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return renderButtons();
}
