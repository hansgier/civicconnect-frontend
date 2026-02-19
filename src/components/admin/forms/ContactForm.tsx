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
import { Badge } from '@/components/ui/badge';
import { X, Phone, Mail, Clock, MapPin, Plus } from 'lucide-react';
import type { ApiContact } from '@/types/api';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ApiContact | null;
  onSubmit: (data: ContactFormData) => void;
  isSubmitting?: boolean;
}

export interface ContactFormData {
  title: string;
  description?: string;
  phoneNumbers: string[];
  primaryPhone?: string;
  emails: string[];
  schedule?: string;
  location?: string;
  type: string;
  isEmergency: boolean;
  order?: number;
}

const CONTACT_TYPES = [
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'WATER', label: 'Water' },
  { value: 'ELECTRICITY', label: 'Electricity' },
];

export function ContactForm({ open, onOpenChange, contact, onSubmit, isSubmitting }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    title: '',
    description: '',
    phoneNumbers: [],
    primaryPhone: '',
    emails: [],
    schedule: '',
    location: '',
    type: 'GOVERNMENT',
    isEmergency: false,
    order: 0,
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // Sync form data with contact prop when dialog opens (render-time state sync)
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const syncKey = open ? (contact?.id ?? '__new__') : null;
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open) {
      if (contact) {
        setFormData({
          title: contact.title || '',
          description: contact.description || '',
          phoneNumbers: contact.phoneNumbers || [],
          primaryPhone: contact.primaryPhone || '',
          emails: contact.emails || [],
          schedule: contact.schedule || '',
          location: contact.location || '',
          type: contact.type || 'GOVERNMENT',
          isEmergency: contact.isEmergency || false,
          order: contact.order || 0,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          phoneNumbers: [],
          primaryPhone: '',
          emails: [],
          schedule: '',
          location: '',
          type: 'GOVERNMENT',
          isEmergency: false,
          order: 0,
        });
      }
      setPhoneInput('');
      setEmailInput('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addPhone = () => {
    if (phoneInput.trim() && !formData.phoneNumbers.includes(phoneInput.trim())) {
      setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, phoneInput.trim()] });
      setPhoneInput('');
    }
  };

  const removePhone = (phone: string) => {
    setFormData({ ...formData, phoneNumbers: formData.phoneNumbers.filter((p) => p !== phone) });
  };

  const addEmail = () => {
    if (emailInput.trim() && !formData.emails.includes(emailInput.trim())) {
      setFormData({ ...formData, emails: [...formData.emails, emailInput.trim()] });
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setFormData({ ...formData, emails: formData.emails.filter((e) => e !== email) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="p-8 pb-4 shrink-0 border-b border-border/10 bg-primary/5 flex flex-col gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {contact ? 'Edit Contact' : 'Create Contact'}
          </DialogTitle>
          <DialogDescription>
            {contact ? 'Update the details of this official or emergency contact.' : 'Add a new contact to the city directory for residents to access.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0 w-full">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  General Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Contact Name *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Ormoc City Health Office"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Category *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-2 border-border/40 hover:border-border/80 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl border-border/10">
                        {CONTACT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="rounded-lg">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 px-1 py-2 h-11 self-end">
                    <Checkbox
                      id="isEmergency"
                      checked={formData.isEmergency}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isEmergency: checked as boolean })
                      }
                      className="size-5 rounded-md border-2 border-border/40 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                    />
                    <Label 
                      htmlFor="isEmergency" 
                      className="text-sm font-bold leading-none cursor-pointer select-none text-destructive"
                    >
                      Emergency Hotline
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of services or role..."
                    className="min-h-[80px] rounded-xl border-2 border-border/40 bg-background/50 hover:border-border/80 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6 pt-4 border-t border-border/10">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  Contact Methods
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Numbers</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="Add phone number"
                          className="pl-11"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
                        />
                      </div>
                      <Button type="button" variant="outline" size="icon" onClick={addPhone} className="shrink-0 h-11 w-11">
                        <Plus className="size-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.phoneNumbers.map((phone) => (
                        <Badge key={phone} variant="default" className="gap-1.5 px-3 py-1.5 rounded-lg font-medium normal-case tracking-normal">
                          {phone}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => removePhone(phone)}
                          />
                        </Badge>
                      ))}
                      {formData.phoneNumbers.length === 0 && (
                        <p className="text-[10px] font-medium text-muted-foreground/60 italic py-1 px-1">No phone numbers added</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Addresses</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Add email address"
                          className="pl-11"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                        />
                      </div>
                      <Button type="button" variant="outline" size="icon" onClick={addEmail} className="shrink-0 h-11 w-11">
                        <Plus className="size-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.emails.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1.5 px-3 py-1.5 rounded-lg font-medium normal-case tracking-normal">
                          {email}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => removeEmail(email)}
                          />
                        </Badge>
                      ))}
                      {formData.emails.length === 0 && (
                        <p className="text-[10px] font-medium text-muted-foreground/60 italic py-1 px-1">No email addresses added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location and Schedule */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-primary" />
                  Availability & Location
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Operating Schedule</Label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="schedule"
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        placeholder="e.g., Mon-Fri 8AM-5PM"
                        className="pl-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="px-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Office Location</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Complete office address"
                        className="pl-11"
                      />
                    </div>
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
              {isSubmitting ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
