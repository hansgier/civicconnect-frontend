import { useState } from 'react';
import { toast } from 'sonner';
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
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminProjectsList } from '@/hooks/admin/use-admin-projects';
import type { ApiProjectUpdate } from '@/types/api';

interface UpdateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  update?: ApiProjectUpdate | null;
  projectId?: string;
  onSubmit: (data: UpdateFormData) => void;
  isSubmitting?: boolean;
}

export interface UpdateFormData {
  projectId: string;
  title: string;
  description?: string;
  date?: string;
}

export function UpdateForm({ open, onOpenChange, update, projectId, onSubmit, isSubmitting }: UpdateFormProps) {
  const { data: projectsData } = useAdminProjectsList({ limit: 100 });
  const [formData, setFormData] = useState<UpdateFormData>({
    projectId: projectId || '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Sync form data with update prop when dialog opens (render-time state sync)
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const syncKey = open ? (update?.id ?? `__new__:${projectId ?? ''}`) : null;
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open) {
      setFormData({
        projectId: update?.projectId || projectId || '',
        title: update?.title || '',
        description: update?.description || '',
        date: update?.date ? update.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 shrink-0 border-b border-border/10 bg-primary/5 flex flex-col gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {update ? 'Edit Update' : 'Create Update'}
          </DialogTitle>
          <DialogDescription>
            {update ? 'Update the details of this project status report.' : 'Add a new progress update to keep residents informed about the project status.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0 w-full">
            <div className="space-y-6">
              {!update && !projectId && (
                <div className="space-y-2">
                  <Label htmlFor="projectId" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Project *</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-2 border-border/40 hover:border-border/80 transition-all">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl border-border/10">
                      {projectsData?.data.map((project) => (
                        <SelectItem key={project.id} value={project.id} className="rounded-lg">
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Update Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Foundation work complete"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the progress made in this phase..."
                  className="min-h-[150px] rounded-xl border-2 border-border/40 bg-background/50 hover:border-border/80 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Report Date</Label>
                <DatePicker
                  id="date"
                  date={formData.date}
                  onChange={(value) => setFormData({ ...formData, date: value })}
                />
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
              {isSubmitting ? 'Saving...' : update ? 'Update Report' : 'Post Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
