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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Activity } from 'lucide-react';
import type { ApiUser } from '@/types/api';

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApiUser | null;
  onUpdateRole: (userId: string, role: string) => void;
  onUpdateStatus: (userId: string, status: string) => void;
  onDelete: (userId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ASSISTANT_ADMIN', label: 'Assistant Admin' },
  { value: 'BARANGAY', label: 'Barangay' },
  { value: 'CITIZEN', label: 'Citizen' },
];

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  onUpdateRole,
  onUpdateStatus,
  onDelete,
  isUpdating,
  isDeleting,
}: UserEditDialogProps) {
  const { user: currentUser } = useAuth();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  // Sync role/status with user prop when dialog opens (render-time state sync)
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null);
  const syncKey = open ? (user?.id ?? '__none__') : null;
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (open && user) {
      setRole(user.role || '');
      setStatus(user.status || '');
    }
  }

  if (!user) return null;

  const isSelf = currentUser?.id === user.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl flex flex-col gap-0 max-h-[90vh]">
        <DialogHeader className="p-8 pb-6 shrink-0 border-b border-border/10 bg-primary/5 flex flex-col gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">Manage User Permissions</DialogTitle>
          <DialogDescription className="mt-1.5">
            Modify access levels and account status for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0 w-full">
          {/* User Profile Card */}
          <div className="rounded-2xl border-2 border-border/40 bg-muted/20 p-5 space-y-4 relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform duration-500 group-hover:scale-110">
                <User className="size-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold truncate">{user.name}</h4>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                  <Mail className="size-3" />
                  <span className="text-xs truncate">{user.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1 relative z-10">
              <Badge variant="default" className="rounded-lg">{user.role}</Badge>
              <Badge variant="outline" className="rounded-lg border-primary/20 text-primary bg-primary/5">{user.status}</Badge>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1 mb-2">
                <Shield className="size-3.5 text-primary" />
                <Label htmlFor="role" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Access Role</Label>
              </div>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  onUpdateRole(user.id, value);
                }}
                disabled={isSelf || isUpdating}
              >
                <SelectTrigger id="role" className="h-11 rounded-xl border-2 border-border/40 hover:border-border/80 transition-all focus:ring-4 focus:ring-primary/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-border/10">
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="rounded-lg">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf && (
                <p className="px-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider italic">You cannot demote your own account</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1 mb-2">
                <Activity className="size-3.5 text-primary" />
                <Label htmlFor="status" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Status</Label>
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  onUpdateStatus(user.id, value);
                }}
                disabled={isSelf || isUpdating}
              >
                <SelectTrigger id="status" className="h-11 rounded-xl border-2 border-border/40 hover:border-border/80 transition-all focus:ring-4 focus:ring-primary/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-border/10">
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="rounded-lg">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 shrink-0 bg-muted/10 border-t border-border/10 gap-3">
          <Button
            variant="destructive"
            onClick={() => onDelete(user.id)}
            disabled={isSelf || isDeleting}
            className="flex-1 sm:flex-none px-6"
          >
            {isDeleting ? 'Removing...' : 'Delete User'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none px-8"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
