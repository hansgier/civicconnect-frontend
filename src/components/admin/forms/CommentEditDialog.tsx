import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, FolderOpen, MessageSquare, MessageCircle } from 'lucide-react';
import type { ApiComment } from '@/types/api';

interface CommentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: ApiComment | null;
  onSubmit: (data: CommentEditFormData) => void;
  isSubmitting?: boolean;
}

export interface CommentEditFormData {
  content: string;
  isOfficial: boolean;
}

export function CommentEditDialog({
  open,
  onOpenChange,
  comment,
  onSubmit,
  isSubmitting,
}: CommentEditDialogProps) {
  const [formData, setFormData] = useState<CommentEditFormData>({
    content: '',
    isOfficial: false,
  });

  // Sync form data with comment prop when dialog opens (render-time state sync)
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const syncKey = open ? (comment?.id ?? '__none__') : null;
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open && comment) {
      setFormData({
        content: comment.content || '',
        isOfficial: comment.isOfficial || false,
      });
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!comment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 shrink-0 border-b border-border/10 bg-primary/5 flex flex-col gap-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <MessageSquare className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Moderate Comment</DialogTitle>
          </div>
          <DialogDescription className="px-1">
            Review and modify this project comment or escalate it to an official response.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0 w-full">
            <div className="space-y-8">
              {/* Context Information Card */}
              <div className="rounded-2xl border-2 border-border/40 bg-muted/20 p-5 space-y-4 relative overflow-hidden group">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="size-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
                    {comment.user?.avatar ? (
                      <img src={comment.user.avatar} alt="" className="size-full object-cover" />
                    ) : (
                      <User className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Comment Author</p>
                    <h4 className="text-sm font-bold truncate">{comment.user?.name || 'Anonymous Resident'}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 relative z-10">
                  <div className="p-1.5 bg-background rounded-lg border border-border/40 text-muted-foreground">
                    <FolderOpen className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Related Project</p>
                    <p className="text-xs font-semibold truncate text-primary">{comment.projectId}</p>
                  </div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 size-24 bg-primary/5 rounded-full transition-transform duration-700 group-hover:scale-150" />
              </div>

              {/* Content Field */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <MessageCircle className="size-3.5 text-primary" />
                  <Label htmlFor="content" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Comment Content</Label>
                </div>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="The original comment text..."
                  className="min-h-[160px] rounded-xl border-2 border-border/40 bg-background/50 hover:border-border/80 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm leading-relaxed"
                />
              </div>

              {/* Official Toggle */}
              <div className="flex items-center gap-4 px-1 py-4 border-t border-border/10">
                <Checkbox
                  id="isOfficial"
                  checked={formData.isOfficial}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isOfficial: checked as boolean })
                  }
                  className="size-6 rounded-lg border-2 border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300 scale-110"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="isOfficial" 
                    className="text-sm font-bold leading-none cursor-pointer select-none"
                  >
                    Mark as Official Response
                  </Label>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    This will highlight the comment as a verified city hall response
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 shrink-0 bg-muted/10 border-t border-border/10 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
