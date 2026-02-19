import { useState, useCallback } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { MediaUpload } from '@/components/ui/media-upload';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { useBarangays } from '@/hooks/use-barangays';
import type { ApiProjectListItem, ApiProjectDetail } from '@/types/api';
import { projectSchema, validateForm } from './validation';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ApiProjectListItem | ApiProjectDetail | null;
  onSubmit: (data: ProjectFormData, media: { newFiles: File[], deletedIds: string[] }) => void;
  isSubmitting?: boolean;
}

export interface ProjectFormData {
  id?: string; // Add ID to track data source
  title: string;
  description: string;
  cost?: string;
  startDate?: string;
  dueDate?: string;
  status: string;
  category?: string;
  implementingAgency?: string;
  contractor?: string;
  barangayIds: string[];
}

const statusOptions = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'APPROVED_PROPOSAL', label: 'Approved Proposal' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const categories = [
  { value: 'INSTITUTIONAL', label: 'Institutional' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'WATER', label: 'Water' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SPORTS_AND_RECREATION', label: 'Sports and Recreation' },
  { value: 'ECONOMIC', label: 'Economic' },
];

export function ProjectForm({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    id: '',
    title: '',
    description: '',
    cost: '',
    startDate: '',
    dueDate: '',
    status: 'PLANNED',
    category: 'INSTITUTIONAL',
    implementingAgency: '',
    contractor: '',
    barangayIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [isBarangayOpen, setIsBarangayOpen] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState('');

  // Media state
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Sync form data with project prop when dialog opens (render-time state sync)
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const syncKey = open ? (project?.id ?? '__new__') : null;
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open) {
      if (project) {
        const projectWithBarangays = project as ApiProjectListItem & { barangayIds?: string[] };
        setFormData({
          id: project.id,
          title: project.title || '',
          description: project.description || '',
          cost: project.cost ? String(project.cost) : '',
          startDate: project.startDate?.split('T')[0] || '',
          dueDate: project.dueDate?.split('T')[0] || '',
          status: project.status || 'PLANNED',
          category: project.category || 'INSTITUTIONAL',
          implementingAgency: project.implementingAgency || '',
          contractor: project.contractor || '',
          barangayIds: projectWithBarangays.barangayIds || project.barangays?.map((b) => b.barangayId) || [],
        });
      } else {
        setFormData({
          id: '',
          title: '',
          description: '',
          cost: '',
          startDate: '',
          dueDate: '',
          status: 'PLANNED',
          category: 'INSTITUTIONAL',
          implementingAgency: '',
          contractor: '',
          barangayIds: [],
        });
      }
      setErrors({});
      setNewFiles([]);
      setDeletedIds([]);
    }
  }

  const { data: barangays = [] } = useBarangays();

  const filteredBarangays = barangays.filter((b) =>
    b.name.toLowerCase().includes(barangaySearch.toLowerCase())
  );

  const toggleBarangay = (id: string) => {
    setFormData((prev) => {
      const exists = prev.barangayIds.includes(id);
      if (exists) {
        return { ...prev, barangayIds: prev.barangayIds.filter((bid) => bid !== id) };
      } else {
        return { ...prev, barangayIds: [...prev.barangayIds, id] };
      }
    });
  };

  const handleMediaChange = useCallback((files: File[], deleted: string[]) => {
    setNewFiles(files);
    setDeletedIds(deleted);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicitly check for empty strings in optional fields and normalize them
    const normalizedData = {
      ...formData,
      cost: formData.cost === '' ? undefined : formData.cost,
      implementingAgency: formData.implementingAgency === '' ? undefined : formData.implementingAgency,
      contractor: formData.contractor === '' ? undefined : formData.contractor,
      category: formData.category === '' ? undefined : formData.category,
    };

    const result = validateForm(projectSchema, normalizedData);
    if (!result.success) {
      setErrors(result.errors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(result.errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setErrors({});
    onSubmit(normalizedData, { newFiles, deletedIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 shrink-0 border-b border-border/10 bg-primary/5 flex flex-col gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {project ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {project ? `Update the details for project "${project.title}".` : 'Enter the project details below to create a new infrastructure project for the city.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0 w-full">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="title" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project name"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && <p className="text-[10px] font-medium text-destructive px-1">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Description *</Label>
                  <div className={cn(
                    "rounded-xl overflow-hidden transition-all duration-200",
                    errors.description ? 'border-destructive' : ''
                  )}>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) => setFormData({ ...formData, description: content })}
                      placeholder="Project details, goals, and scope..."
                    />
                  </div>
                  {errors.description && <p className="text-[10px] font-medium text-destructive px-1">{errors.description}</p>}
                </div>
              </div>

              {/* Status and Category */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className={cn(
                      "h-11 rounded-xl border-2 transition-all",
                      errors.status ? "border-destructive ring-destructive/10" : "border-border/40 hover:border-border/80"
                    )}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl border-border/10">
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-[10px] font-medium text-destructive px-1">{errors.status}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={cn(
                      "h-11 rounded-xl border-2 transition-all",
                      errors.category ? "border-destructive ring-destructive/10" : "border-border/40 hover:border-border/80"
                    )}>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl border-border/10">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-lg">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-[10px] font-medium text-destructive px-1">{errors.category}</p>}
                </div>
              </div>

              {/* Financials and Timeline */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  Execution Details
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Budget (PHP)</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold text-xs pointer-events-none">
                        PHP
                      </div>
                      <Input
                        id="cost"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        className={cn(
                          "pl-12",
                          errors.cost ? 'border-destructive' : ''
                        )}
                      />
                    </div>
                    {errors.cost && <p className="text-[10px] font-medium text-destructive px-1">{errors.cost}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Contractor</Label>
                    <Input
                      id="contractor"
                      value={formData.contractor}
                      onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                      placeholder="Contractor name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Start Date *</Label>
                    <DatePicker
                      id="startDate"
                      date={formData.startDate}
                      onChange={(value) => setFormData({ ...formData, startDate: value })}
                      className={errors.startDate ? 'border-destructive' : ''}
                    />
                    {errors.startDate && <p className="text-[10px] font-medium text-destructive px-1">{errors.startDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Due Date *</Label>
                    <DatePicker
                      id="dueDate"
                      date={formData.dueDate}
                      onChange={(value) => setFormData({ ...formData, dueDate: value })}
                      className={errors.dueDate ? 'border-destructive' : ''}
                    />
                    {errors.dueDate && <p className="text-[10px] font-medium text-destructive px-1">{errors.dueDate}</p>}
                  </div>
                </div>
              </div>

              {/* Project Media */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  Project Media
                </h3>
                <MediaUpload
                  existingMedia={(project as ApiProjectDetail)?.media}
                  onChange={handleMediaChange}
                />
              </div>

              {/* Agencies and Barangays */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <div className="space-y-2">
                  <Label htmlFor="implementingAgency" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Implementing Agency</Label>
                  <Input
                    id="implementingAgency"
                    value={formData.implementingAgency}
                    onChange={(e) => setFormData({ ...formData, implementingAgency: e.target.value })}
                    placeholder="Agency name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={cn("px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider", errors.barangayIds ? 'text-destructive' : '')}>
                    Affected Barangays *
                  </Label>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.barangayIds.map((id) => {
                      const b = barangays?.find((brgy) => brgy.id === id);
                      return (
                        <Badge key={id} variant="default" className="gap-1.5 px-3 py-1.5 rounded-lg font-medium text-[11px] normal-case tracking-normal">
                          {b?.name || id}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => toggleBarangay(id)}
                          />
                        </Badge>
                      );
                    })}
                    {formData.barangayIds.length === 0 && (
                      <p className="text-xs text-muted-foreground/60 italic py-1 px-1">No barangays selected</p>
                    )}
                  </div>

                  <Popover open={isBarangayOpen} onOpenChange={setIsBarangayOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isBarangayOpen}
                        className="w-full justify-between h-11 rounded-xl border-2 border-border/40 bg-background/50 hover:bg-background hover:border-border/80 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground/50" />
                          Select Barangays...
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-2xl border-border/20 overflow-hidden">
                      <div className="p-3 bg-muted/30 border-b border-border/20">
                        <Input
                          placeholder="Search barangay..."
                          value={barangaySearch}
                          onChange={(e) => setBarangaySearch(e.target.value)}
                          className="h-9 rounded-lg border-none bg-background shadow-none px-2"
                        />
                      </div>
                      <ScrollArea className="h-64">
                        <div className="p-2 space-y-1">
                          {filteredBarangays.map((barangay) => (
                            <div
                              key={barangay.id}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm",
                                formData.barangayIds.includes(barangay.id) 
                                  ? "bg-primary/10 text-primary font-semibold" 
                                  : "hover:bg-accent/50"
                              )}
                              onClick={() => toggleBarangay(barangay.id)}
                            >
                              <span>{barangay.name}</span>
                              {formData.barangayIds.includes(barangay.id) && <Check className="h-4 w-4" />}
                            </div>
                          ))}
                          {filteredBarangays.length === 0 && (
                            <p className="p-4 text-center text-sm text-muted-foreground italic">No results found.</p>
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {errors.barangayIds && <p className="text-[10px] font-medium text-destructive px-1">{errors.barangayIds}</p>}
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
              {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
