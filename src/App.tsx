import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import { Layout } from '@/components/layout/Layout';
import { MasonryFeed } from '@/sections/MasonryFeed';
import { ProjectDetail } from '@/sections/ProjectDetail';
import { AnnouncementTimeline } from '@/sections/AnnouncementTimeline';
import { UserProfile } from '@/sections/UserProfile';
import { Dashboard } from '@/sections/Dashboard';
import { Contacts } from '@/sections/Contacts';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { VerifyEmail } from '@/pages/VerifyEmail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminPanel } from '@/sections/AdminPanel';
import type { SortOption, ProjectFilters } from '@/types';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setSearchQuery('');
  }
  
  // Project filters and sort
  const [projectFilters, setProjectFilters] = useState<ProjectFilters>({
    category: 'All',
    location: 'All',
    status: 'all',
    budgetRange: 'All',
    dateFrom: '',
    dateTo: '',
  });
  const [projectSort, setProjectSort] = useState<SortOption>('newest');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route element={
        <Layout 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
        />
      }>
        <Route index element={
          <MasonryFeed
            filters={projectFilters}
            sort={projectSort}
            search={searchQuery}
            onFilterChange={setProjectFilters}
            onSortChange={setProjectSort}
          />
        } />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="announcements" element={<AnnouncementTimeline search={searchQuery} />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="contacts" element={<Contacts search={searchQuery} />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
