import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { announcementSchema, validateForm } from './validation';
import type { ApiAnnouncement } from '@/types/api';

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: ApiAnnouncement | null;
  onSubmit: (data: AnnouncementFormData) => void;
  isSubmitting?: boolean;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  category?: string;
  isUrgent: boolean;
  location?: string;
}

const ANNOUNCEMENT_CATEGORIES = [
  { value: 'EVENT', label: 'Event' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'POLICY', label: 'Policy' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
];

export function AnnouncementForm({ open, onOpenChange, announcement, onSubmit, isSubmitting }: AnnouncementFormProps) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: '',
    isUrgent: false,
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form data with announcement prop when dialog opens (render-time state sync)
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const syncKey = open ? (announcement?.id ?? '__new__') : null;
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open) {
      if (announcement) {
        setFormData({
          title: announcement.title || '',
          content: announcement.content || '',
          excerpt: announcement.excerpt || '',
          image: announcement.image || '',
          category: announcement.category || '',
          isUrgent: announcement.isUrgent || false,
          location: announcement.location || '',
        });
      } else {
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          image: '',
          category: '',
          isUrgent: false,
          location: '',
        });
      }
      setErrors({});
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(announcementSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 shrink-0 border-b border-border/10 bg-primary/5 flex flex-col gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {announcement ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
          <DialogDescription>
            {announcement ? 'Update the content and priority of this announcement.' : 'Create a new city-wide announcement to inform residents.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0 w-full">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  General Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="title" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && <p className="text-[10px] font-medium text-destructive px-1">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Content *</Label>
                  <div className={cn(
                    "rounded-xl border-2 border-border/40 overflow-hidden transition-all duration-200",
                    errors.content ? 'border-destructive' : 'hover:border-border/80 focus-within:border-primary'
                  )}>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(html) => setFormData({ ...formData, content: html })}
                      placeholder="Announcement content..."
                      minHeight="200px"
                    />
                  </div>
                  {errors.content && <p className="text-[10px] font-medium text-destructive px-1">{errors.content}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of the announcement..."
                    className="min-h-[80px] rounded-xl border-2 border-border/40 bg-background/50 hover:border-border/80 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  {errors.excerpt && <p className="text-[10px] font-medium text-destructive px-1">{errors.excerpt}</p>}
                </div>
              </div>

              {/* Classification and Media */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  Classification & Location
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Category *</Label>
                    <Select
                      value={formData.category || ''}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={cn(
                        "h-11 rounded-xl border-2 transition-all",
                        errors.category ? 'border-destructive ring-destructive/10' : 'border-border/40 hover:border-border/80'
                      )}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-border/10">
                        {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="rounded-lg">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-[10px] font-medium text-destructive px-1">Select a category</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Brgy. Alta Vista"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Cover Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image && <p className="text-[10px] font-medium text-destructive px-1">{errors.image}</p>}
                </div>

                <div className="flex items-center gap-3 px-1 py-2">
                  <Checkbox
                    id="isUrgent"
                    checked={formData.isUrgent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isUrgent: checked as boolean })
                    }
                    className="size-5 rounded-md border-2 border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label 
                      htmlFor="isUrgent" 
                      className="text-sm font-bold leading-none cursor-pointer select-none"
                    >
                      Mark as urgent
                    </Label>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      This will prioritize the announcement for residents
                    </p>
                  </div>
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
              {isSubmitting ? 'Saving...' : announcement ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
