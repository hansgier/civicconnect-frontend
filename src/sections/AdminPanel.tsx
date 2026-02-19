import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AdminProjectsTab,
  AdminUpdatesTab,
  AdminCommentsTab,
  AdminAnnouncementsTab,
  AdminContactsTab,
  AdminUsersTab,
} from '@/components/admin';

export function AdminPanel() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Panel
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage projects, users, and content
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-1 sm:grid-cols-6 lg:w-auto">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <AdminProjectsTab />
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <AdminUpdatesTab />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <AdminCommentsTab />
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <AdminAnnouncementsTab />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <AdminContactsTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AdminUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
