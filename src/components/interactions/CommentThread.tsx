import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { cn, isContentEmpty } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Comment, CommentSortOption } from '@/types';
import { useAuth } from '@/lib/auth';
import { useComments, useCreateComment } from '@/hooks/use-comments';
import { useToggleCommentReaction } from '@/hooks/use-reactions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommentItemProps {
  projectId: string;
  comment: Comment;
  isReply?: boolean;
}

function CommentItem({ projectId, comment, isReply = false }: CommentItemProps) {
  const { isAuthenticated, isGuest } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const createComment = useCreateComment(projectId);
  const toggleLike = useToggleCommentReaction(projectId);

  const submitReply = async () => {
    if (isContentEmpty(replyText) || createComment.isPending) return;
    
    await createComment.mutateAsync({
      content: replyText,
      parentId: comment.id,
    });
    
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <div className={cn('group', isReply && 'ml-12')}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base">{comment.author.name}</span>
            {comment.isOfficial && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Official
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Comment Content */}
          <RichTextRenderer
            content={comment.content}
            className="mb-3 text-sm leading-relaxed"
          />

          {/* Comment Actions */}
          <div className="flex items-center gap-4">
            <button
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                comment.userHasLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500",
                (!isAuthenticated || isGuest) && "opacity-50 cursor-not-allowed"
              )}
              disabled={!isAuthenticated || isGuest || toggleLike.isPending}
              onClick={() => toggleLike.mutate({ commentId: comment.id, type: 'LIKE' })}
            >
              {toggleLike.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Heart 
                  className={cn("h-3.5 w-3.5", comment.userHasLiked && "fill-current")} 
                />
              )}
              <span>{comment.likes}</span>
            </button>

            {/* Reply Button - Only for top-level comments */}
            {!isReply && (
              isAuthenticated && !isGuest ? (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Reply</span>
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-50 cursor-not-allowed">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isGuest ? 'Sign in to reply' : 'Login to reply'}</p>
                  </TooltipContent>
                </Tooltip>
              )
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <RichTextEditor
                content={replyText}
                onChange={setReplyText}
                placeholder={`Reply to ${comment.author.name}...`}
                disabled={createComment.isPending}
                minHeight="80px"
                className="mb-2"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                  disabled={createComment.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={submitReply}
                  disabled={isContentEmpty(replyText) || createComment.isPending}
                >
                  {createComment.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  ) : null}
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Replies - Only render 1 level deep */}
          {!isReply && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-muted pl-4">
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.id} 
                  projectId={projectId} 
                  comment={reply} 
                  isReply 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentThreadProps {
  projectId: string;
  initialComments?: Comment[];
  isLoading?: boolean;
}

const sortOptions: { value: CommentSortOption; label: string }[] = [
  { value: 'relevant', label: 'Relevant' },
  { value: 'top', label: 'Top' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'latest', label: 'Latest' },
];

export function CommentThread({ 
  projectId, 
  initialComments = [],
  isLoading: isInitialLoading = false
}: CommentThreadProps) {
  const { isAuthenticated, isGuest } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [sort, setSort] = useState<CommentSortOption>('relevant');
  const [displayedCount, setDisplayedCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data: apiComments = initialComments, isLoading: isQueryLoading } = useComments(projectId);
  const createComment = useCreateComment(projectId);

  const isLoading = isInitialLoading || isQueryLoading;

  // Sort comments based on selected option
  const sortedComments = useMemo(() => {
    return [...apiComments].sort((a, b) => {
      switch (sort) {
        case 'top':
          return b.likes - a.likes;
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'relevant':
        default: {
          // Relevant = combination of likes and recency
          const aScore = a.likes + (new Date(a.createdAt).getTime() / 1000000000);
          const bScore = b.likes + (new Date(b.createdAt).getTime() / 1000000000);
          return bScore - aScore;
        }
      }
    });
  }, [apiComments, sort]);

  const visibleComments = useMemo(() => {
    return sortedComments.slice(0, displayedCount);
  }, [sortedComments, displayedCount]);

  const hasMore = displayedCount < sortedComments.length;

  // Infinite scroll for comments
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(prev + 5, sortedComments.length));
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, sortedComments.length]);

  const handleSubmit = async () => {
    if (isContentEmpty(newComment) || createComment.isPending) return;

    await createComment.mutateAsync({
      content: newComment,
    });
    
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Community Discussion</h2>

      {/* New Comment Form */}
      <div className="rounded-2xl bg-card">
        {isAuthenticated && !isGuest ? (
          <>
            <RichTextEditor
              content={newComment}
              onChange={setNewComment}
              placeholder="Share your thoughts on this project..."
              disabled={createComment.isPending}
              minHeight="100px"
              className="mb-3"
            />
            <div className="flex justify-end pt-3">
              <Button 
                onClick={handleSubmit} 
                disabled={isContentEmpty(newComment) || createComment.isPending}
              >
                {createComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Post Comment
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              {isGuest 
                ? "Guest users cannot comment. Please sign in to join the discussion."
                : "You must be signed in to join the discussion."}
            </p>
            <Button asChild variant="outline">
              <Link to="/login">Sign In to Comment</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Header with Sort */}
      <div className="flex items-center justify-between border-b pb-4">
        <h4 className="text-lg font-semibold">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : (
            `${apiComments.length} Comments`
          )}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase">Sort by:</span>
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as CommentSortOption)}
          >
            <SelectTrigger size="sm" className="w-[120px] bg-muted/50 border-none shadow-none hover:bg-muted font-semibold">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent align="end" className="bg-popover/95 backdrop-blur-xl border-border/50 shadow-2xl">
              {sortOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="py-2.5"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-8 mt-6">
        {visibleComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            projectId={projectId} 
            comment={comment} 
          />
        ))}

        {visibleComments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Loading Indicator for Infinite Scroll */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more comments...</span>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      {hasMore && !isLoadingMore && (
        <div ref={loaderRef} className="h-4" />
      )}

      {/* End of Comments */}
      {!hasMore && apiComments.length > 0 && !isLoading && !isLoadingMore && (
        <div className="text-center py-8 text-xs text-muted-foreground italic border-t border-dashed">
          You've reached the end of the discussion
        </div>
      )}
    </div>
  );
}
