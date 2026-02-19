import { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  FolderOpen,
  MapPin,
  Calendar,
  Mail,
  Lock,
  Edit2,
  Camera,
  Check,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { useAuth } from '@/lib/auth';
import apiClient from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { cn, stripHtml } from '@/lib/utils';
import {
  useUserStats,
  useUserLikedProjects,
  useUserComments,
  useUserActivity,
  useUpdateUser,
} from '@/hooks/use-users';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Animated counter hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return { count, elementRef };
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: string;
}) {
  const { count, elementRef } = useCountUp(value);

  return (
    <div 
      ref={elementRef}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg',
        color
      )}
    >
      <div className="relative z-10">
        <Icon className="mb-3 h-6 w-6 text-white/80" />
        <p className="text-3xl font-bold text-white">{count}</p>
        <p className="text-sm text-white/70">{label}</p>
      </div>
      
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
}

function TabLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

function TabEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12 border rounded-2xl border-dashed">
      <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function UserProfile() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Feedback state
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Hooks for real data
  const userId = user?.id || '';
  const { data: stats } = useUserStats(userId);
  const { data: likedProjects = [], isLoading: isLikedLoading } = useUserLikedProjects(userId);
  const { data: userComments = [], isLoading: isCommentsLoading } = useUserComments(userId);
  const { data: activity = [], isLoading: isActivityLoading } = useUserActivity(userId);
  const updateUser = useUpdateUser();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size must be under 5MB' });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadStatus(null);
      const response = await apiClient.post(`/users/${user.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const newAvatarUrl = response.data.avatar;
      setUser({ ...user, avatar: newAvatarUrl });
      setEditedUser(prev => ({ ...prev, avatar: newAvatarUrl }));
      
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      setUploadStatus({ type: 'success', message: 'Profile picture updated' });
    } catch (err: unknown) {
      const errorWithResponse = err as { response?: { data?: { message?: string } } };
      setUploadStatus({ 
        type: 'error', 
        message: errorWithResponse.response?.data?.message || 'Failed to upload profile picture' 
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus(null);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordStatus({ type: 'success', message: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorWithResponse = err as { response?: { data?: { message?: string } } };
      setPasswordStatus({ 
        type: 'error', 
        message: errorWithResponse.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    await updateUser.mutateAsync({
      id: user.id,
      updates: {
        name: editedUser.name,
        email: editedUser.email,
        // avatar update would go here if we had the upload logic
      }
    });

    setIsEditDialogOpen(false);
  };

  const statCards = [
    { icon: FolderOpen, label: 'Projects Followed', value: stats?.projectsFollowed || 0, color: 'from-blue-500 to-blue-600' },
    { icon: Heart, label: 'Total Approvals', value: stats?.totalApprovals || 0, color: 'from-green-500 to-green-600' },
    { icon: MessageCircle, label: 'Comments', value: stats?.totalComments || 0, color: 'from-purple-500 to-purple-600' },
  ];

  if (!user) return null;

  return (
    <div className="space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />
      {/* Profile Header */}
      <div className="relative">
        {/* Profile Info */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              title="Change Photo"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 text-center sm:mt-0 sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <div className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {user.role}
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditedUser({ name: user.name, email: user.email, avatar: user.avatar });
                  setIsEditDialogOpen(true);
                }}
                variant="outline"
                className="gap-2 shadow-sm"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <MapPin className="h-4 w-4" />
                Ormoc Resident
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="liked" className="space-y-6">
        <TabsList className="w-full justify-start rounded-xl bg-muted p-1">
          <TabsTrigger value="liked" className="rounded-lg">
            Approved Projects
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-lg">
            Comments
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg">
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* Liked Projects Tab */}
        <TabsContent value="liked" className="space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-semibold">Projects You Approved</h3>
          {isLikedLoading ? (
            <TabLoading />
          ) : likedProjects.length === 0 ? (
            <TabEmpty 
              title="No approvals yet" 
              description="Projects you approve with a LIKE will show up here."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {likedProjects.map((project) => (
                <a
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex gap-4 rounded-2xl border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={project.images[0] || '/placeholder-project.jpg'}
                    alt={project.title}
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {stripHtml(project.description)}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <ThumbsUp className="h-3 w-3 fill-current text-green-500" />
                      <span className="font-bold text-green-600">Approved</span>
                      <span>•</span>
                      <span>{project.location}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-semibold">Your Recent Comments</h3>
          {isCommentsLoading ? (
            <TabLoading />
          ) : userComments.length === 0 ? (
            <TabEmpty 
              title="No comments yet" 
              description="Share your thoughts on community projects to see them here."
            />
          ) : (
            <div className="space-y-4">
              {userComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border bg-card p-5 relative group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <a 
                      href={`/projects/${comment.projectId}`}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      On: {comment.project.title}
                    </a>
                    {comment.isOfficial && (
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">OFFICIAL</span>
                    )}
                  </div>
                  <RichTextRenderer
                    content={comment.content}
                    className="text-sm leading-relaxed mb-4"
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                    <span>{new Date(comment.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                      <Heart className="h-3 w-3 fill-primary text-primary" />
                      {comment.likes} LIKES
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          {isActivityLoading ? (
            <TabLoading />
          ) : activity.length === 0 ? (
            <TabEmpty 
              title="No activity recorded" 
              description="Interact with projects to build your contribution history."
            />
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm",
                    item.type === 'approved' ? 'bg-green-500' : 
                    item.type === 'commented' ? 'bg-blue-500' : 'bg-red-500'
                  )}>
                    {item.type === 'approved' ? <ThumbsUp className="h-5 w-5" /> : 
                     item.type === 'commented' ? <MessageCircle className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {item.type === 'approved' ? 'Approved' : 
                       item.type === 'commented' ? 'Commented on' : 'Disapproved'}
                      {' '}
                      <a href={`/projects/${item.projectId}`} className="text-primary hover:underline">{item.projectTitle}</a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {item.content && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md italic">
                        "{stripHtml(item.content)}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setUploadStatus(null);
            setPasswordStatus(null);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={editedUser.avatar} alt={user.name} />
                <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </Button>
                {uploadStatus ? (
                  <p className={cn(
                    "text-[10px] font-medium",
                    uploadStatus.type === 'success' ? "text-green-500" : "text-red-500"
                  )}>
                    {uploadStatus.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Upload a square image for best results.</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-4 border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  <span>Security</span>
                </div>
                {passwordStatus && (
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    passwordStatus.type === 'success' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {passwordStatus.message}
                  </span>
                )}
              </div>
              
              <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Current password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-9 text-sm" 
                  />
                  <Input 
                    type="password" 
                    placeholder="New password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 text-sm" 
                  />
                  <Input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 text-sm" 
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                  size="sm"
                  variant="secondary"
                  className="w-full h-8 text-xs gap-2"
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Update Password
                </Button>
              </div>
            </div>
          </div>

          {updateUser.isError && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded-md">
              Failed to update profile. Please try again.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="flex-1"
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="flex-1 gap-2"
              disabled={updateUser.isPending || !editedUser.name || !editedUser.email}
            >
              {updateUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
