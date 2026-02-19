# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-02-19

### Fixed
- **Build Readiness**: Resolved critical TypeScript compilation errors across the frontend to enable production deployment.
  - Fixed type-safety issues in `use-admin-projects` and `use-admin-updates` hooks related to conditional property access and type assertions during data normalization.
- **Frontend Code Quality**: Resolved a linting error in `Contacts.tsx` where the `Loader2` icon was imported but never used.
- **Real-time Dashboard Refresh**: Updated project, reaction, and comment mutations to invalidate the `['dashboard']` query key. This ensures the dashboard re-fetches and displays up-to-date project counts and engagement stats immediately after changes.
- **Comprehensive Lint Resolution**: Resolved 46 ESLint problems (42 errors, 4 warnings) across the frontend application.
  - **Render-time State Sync**: Eliminated `react-hooks/set-state-in-effect` errors by replacing `useEffect` synchronization with React's recommended render-time state sync pattern using a `prevSyncKey` tracker.
  - **Robust Typing**: Removed all `as any` casts in admin tabs, hooks, and transformation logic, replacing them with specific types from `ApiProjectListItem`, `ApiAnnouncement`, etc.
  - **React Compiler Optimization**: Resolved `react-hooks/preserve-manual-memoization` and dependency warnings in `MediaUpload` by correctly mapping array dependencies.
  - **Safe Regex**: Fixed `no-useless-escape` in URL validation regex.
  - **Component Discipline**: Added `eslint-disable` for legitimate multi-export files (e.g., `badge.tsx`, `auth.tsx`) to satisfy `react-refresh/only-export-components`.
- **Project Update Dates**: Fixed inaccurate dates in the project updates timeline by prioritizing the actual event date from the API over the database creation timestamp.
  - Updated `ProjectUpdate` type to include the `date` field.
  - Modified `transformProjectUpdate` to prioritize the `date` field with `createdAt` as fallback.
  - Updated `UpdatesTimeline` UI to display the correct event date.

### Added
- **Premium Emergency Contact UI**: Enhanced the Emergency Contact card with a high-fidelity, non-generic design:
  - Rich red-to-rose gradients with glassmorphic overlays and backdrop blur.
  - Subtle inner glow and animated hover states for a more tactile, premium feel.
  - Improved text contrast and hierarchy specifically for emergency hotline visibility.
- **Dashboard Projects by Status Bar Graph**: Replaced the simple horizontal bar chart with an interactive grouped bar chart showing project status distribution over time
  - New `GroupedBarChart` component (`src/sections/Dashboard.tsx`):
    - Groups projects by status (Ongoing, Completed, Planned, Approved Proposal, On Hold, Cancelled) for each time period
    - Supports both Monthly (12 months) and Yearly (5 years) views via existing filter
    - Interactive tooltips showing exact project counts on hover
    - Color-coded bars matching existing status colors from donut chart
    - Responsive SVG-based rendering with proper axes and grid lines
    - Legend showing all status types with their colors
  - New `useStatusTrends` hook (`src/hooks/use-dashboard.ts`): Fetches status distribution data from new backend endpoint
  - Added `ApiStatusTrendData` type (`src/types/api.ts`): Type definition for status trend data
  - Integrated with existing time filter (Monthly/Yearly selector) to control data range
  - Card now shows "Last N months" indicator to match other trend cards

### Updated
- **Share Dialog Refinement**: Optimized the `ShareDialog` for better visual balance and consistency with the project's design language:
  - Scaled down typography and spacing to match sidebar widgets (reduced title from `text-3xl` to `text-xl`).
  - Compacted the preview card and social grid with smaller, more standardized icon sizes (`h-14` vs `h-20`).
  - Standardized rounded corners and internal padding to align with the application's hybrid standard/premium UI structure.
- **Project Detail UI Refinement**: Balanced high-fidelity component design with standard page architecture:
  - **Preserved**: The premium "Project Details" widget in the sidebar featuring glassmorphic backgrounds (`backdrop-blur-md`), tactile `InfoRow` items, and vertical primary accent pill.
  - **Reverted**: Restored standard card styling (`rounded-2xl border bg-card p-6`) for the project description, updates timeline, and voting modules to maintain page hierarchy.
  - **Maintained**: The high-fidelity `ShareDialog` redesign exactly matching reference specifications (3-column social grid, quoted previews, sleek link pills).
  - **Skeleton**: Re-adjusted layout skeletons to reflect the hybrid standard/premium UI structure.
- **Project Detail Visual Redesign**: Significantly upgraded the aesthetic quality of the project view:
  - **Premium Key Info Widget**: Replaced the generic info grid with a unified, high-fidelity "Project Details" card featuring glassmorphic backgrounds (`backdrop-blur-md`), tactile icon rows, and distinct visual hierarchy for the project budget.
  - **Enhanced Typography**: Implemented a modern text stack with uppercase sub-labels, bold values, and dashed separators for improved scannability in the sidebar.
- **Project Detail Layout Optimization**: Streamlined the `ProjectDetail` page for better information density and hierarchy:
  - **Removed**: Redundant `Quick Stats` and `Project Progress` sections to reduce visual clutter.
  - **Relocated**: Transferred the `Key Info Grid` from the main content area to the right sidebar, providing a dedicated "Key Project Details" widget that remains visible alongside the project description.
  - **Skeleton**: Updated layout skeletons to reflect the new sidebar-heavy architecture.
- **Comment Thread Sort Redesign**: Replaced the generic native sort selector with a premium custom UI:
  - Integrated Radix-based `Select` component with `backdrop-blur-xl` menus and smooth animations.
  - Styled the trigger as a subtle "Floating Pill" to match the modern discussion header.
  - Enhanced options with horizontal hover shifts and animated check indicators.

### Fixed
- **Media Deletion Logic**: Fixed a bug where deleting a single image from a project wouldn't persist due to backend string/array mismatch.
- **Form Data Normalization**: Fixed an issue where project updates would fail if optional fields (like cost or contractor) were left empty.
- **Project Edit Synchronization**: Fixed a bug where editing a project would show empty fields while data was being fetched in the background.

### Updated
- **Global Admin UI Overhaul**: Applied the new "Ormoc PIS" design language across all administrative modules (**Updates**, **Comments**, **Contacts**, **Users**):
  - **Modern Dialogs**: All forms now use a cohesive `rounded-2xl` architecture with `backdrop-blur-xl` surfaces and fixed headers/footers for better scrolling.
  - **Standardized Inputs**: Applied consistent `rounded-xl` borders and high-contrast focus states to every input and select component in the admin panel.
  - **Dynamic Lists**: Redesigned the Contacts management with interactive "Pill Badge" lists for phone numbers and emails, replacing simple text displays.
  - **Enhanced Profiles**: Upgraded the User and Comment management dialogs with information cards that provide better context (author info, project links) with a premium aesthetic.
- **Form State Reliability**: Upgraded all admin forms to a robust `useEffect` synchronization pattern, eliminating bugs where data wouldn't load or fields would appear empty during edits.
- **UI Component Redesign**: Significant overhaul of core UI components for a more premium, modern aesthetic:
  - **Button**: Enhanced with subtle gradients (`from-primary to-primary/80`), smoother transitions (`active:scale-95`), and better elevation effects. Added a new `glass` variant using backdrop blur.
  - **Input**: Redesigned with increased height (`h-10`), rounded corners (`rounded-lg`), and a custom glowing focus state using the primary coral color. Added subtle background transitions on hover and focus.
  - **Badge**: Modernized with a fully rounded (`rounded-full`) pill shape and integrated status-specific gradients (`planning`, `progress`, `completed`, `urgent`) directly into the component logic. Added a `soft` variant for high-legibility secondary tags.
- **Date Picker Implementation**: Replaced generic browser date inputs with a custom-built, highly aesthetic Date Picker:
  - Created `Calendar` component based on `react-day-picker`, fully styled to match the Ormoc PIS brand colors (Coral/Electric Blue).
  - Created `DatePicker` wrapper using `Popover` and the new `Calendar`, featuring "Today" and "Clear" shortcuts, and a clear, icon-enhanced trigger.
  - Integrated the new `DatePicker` across all forms (`ProjectForm`, `UpdateForm`) and the `FilterPanel`.
- **Contacts Page Redesign**: Redesigned layout and components for better visual hierarchy and user experience:
  - Emergency hotlines now use 2-3 column grid (previously 5 columns) for better readability
  - Redesigned `ContactCard` with improved information architecture:
    - Prominent primary phone number display with gradient background for emergency contacts
    - Alternative phone numbers shown as inline tags instead of stacked boxes
    - Contact details (email, schedule, location) use icon+text inline layout with consistent icon containers
    - Added emergency accent bar and "Emergency" badge for emergency contacts
    - Improved typography with better text hierarchy and spacing
    - All contact info (emails, location) now fully visible without truncation
  - Enhanced page header with icon container and improved description
  - Redesigned emergency section header with icon badge and subtitle
  - Improved empty state with larger icon, better messaging, and background styling
  - Better responsive grid breakpoints for all contact sections
  - Consistent use of app design patterns: `rounded-2xl`, `cn()` utility, hover lift effects, dark mode support
- **Contacts Sort Options**: Simplified sort options from "Name, Type, Newest" to "A-Z" and "Z-A" for better clarity
  - Updated `ContactSortOption` type to `'name-asc' | 'name-desc'`
  - Updated sort dropdown UI to show "A-Z" and "Z-A" labels
  - Updated mapping to backend API parameters

### Fixed
- **Admin Contacts Cache Invalidation**: Fixed issue where changes to contacts were not immediately reflected in the admin table after saving
  - All contact mutations (create, update, delete, bulk delete) now properly invalidate both admin contacts query (`['admin', 'contacts']`) and public contacts query (`['contacts']`)
  - This ensures the admin table refreshes immediately after any contact modification

### Added
- **Rich Text Editor in Admin Panel**: Integrated TipTap rich text editor into admin forms for:
  - Project description field (in Add/Edit Project form)
  - Announcement content field (in Add/Edit Announcement form)
  - Provides formatting options: Bold, Italic, Underline, Headings (H2, H3), Bullet/Ordered lists
  - Maintains backward compatibility with existing validation and backend storage
  - Excerpt field in Announcements remains as plain text (intended for brief summaries)

### Fixed
- **Optional Field Handling**: Fixed validation and submission logic to ensure optional fields can be left empty without errors:
  - Announcements: `Location`, `Image URL`, and `Excerpt` are now strictly optional.
  - Projects: `Contractor` and `Implementing Agency` are now strictly optional.
  - Refined Zod schemas to handle empty strings properly.
  - Updated API hooks to convert empty optional strings to `undefined` for backend compatibility.
- **Build stabilization**: Resolved 100+ TypeScript errors to enable successful production builds.
  - Fixed Zod `errorMap` and `enum` validation errors by adopting standard Zod syntax.
  - Resolved `useQuery` type inference issues by providing explicit generic types and error handling.
  - Fixed type mismatches between `AuthUser` and `User` interfaces across layout and transformation logic.
  - Resolved "Cannot find name 'process'" in `ErrorBoundary` by switching to Vite-native `import.meta.env`.
  - Fixed `erasableSyntaxOnly` compatibility issues by refactoring class constructor parameter properties.
  - Cleaned up multiple unused imports, variables, and duplicate object properties across the Admin panel.
  - Updated `StatusBadge` to support and color-code all contact types (Emergency, Government, Health, etc.).
- **Admin Excerpt Bug**: Fixed an issue where clearing the "Excerpt" in Announcements or Projects would not save to the database. Optional fields now correctly send `null` or empty strings to the backend to ensure they are cleared.
- **UI Components**: Added missing `Badge` component to support the new searchable multi-select in project forms.
- **Admin White Screen**: Fixed a critical error where providing an empty string to Radix Select components caused a crash. Project filters now use "none" as a placeholder value.
- **Admin Updates & Comments**: Correctly handled the "No Project Selected" state in both hooks and UI components.
- **Search Optimization**: Implemented 500ms debouncing in the Admin Search bar to improve performance and reduce unnecessary API calls.
- **Interactive Sorting**: Added universal sorting capabilities to all Admin Panel tables (Projects, Users, Announcements, Updates, Comments, and Contacts). Users can now toggle sort direction and switch columns by clicking table headers.
- **Proper A-Z & Date Sorting**: Refactored the backend to support dynamic sorting by title, name, content, and date across all modules. This ensures that sorting works correctly across multiple pages of data.

### Fixed
- **Admin Announcements**: Fixed Add and Edit Announcement functionality by aligning with backend data structures.
  - Updated `use-admin-announcements.ts` to wrap payloads in a `body` property as required by backend Zod schemas.
  - Implemented `prepareAnnouncementData` helper to convert empty optional strings (like image URLs) to `undefined`.
- **Admin UX Improvements**: Enhanced clarity for Project Selection requirements in Updates and Comments tabs.
  - Added instructional empty states explaining that a project must be selected from the filter to view data.
- **Admin Project Management**: Fixed Add and Edit Project functionality by normalizing data types before submission.
  - Implemented `prepareProjectData` helper to convert dates to ISO strings, parse cost to numeric, and handle empty optional strings.
  - Added pre-submission validation to ensure at least one Barangay is selected.
  - Improved error messaging in Project forms.
- **Admin Bulk Actions**: Fixed broken bulk delete endpoints across all modules by replacing `POST /bulk-delete` calls with sequential individual `DELETE` requests.
  - Updated `useDeleteProjectsBulk` in `use-admin-projects.ts`.
  - Updated `useDeleteAnnouncementsBulk` in `use-admin-announcements.ts`.
  - Updated `useDeleteContactsBulk` in `use-admin-contacts.ts`.
- **Admin Users**: Fixed broken user management endpoints by using the general `/users/:id` route for role and status updates.
  - Updated `useUpdateUserRole` and `useUpdateUserStatus` to call `PATCH /users/:id` directly.
  - Replaced non-existent bulk delete endpoint with sequential individual `DELETE` calls in `useDeleteUsersBulk`.
- **Admin Comments**: Fixed broken `/comments` endpoints by nesting them under `/projects/:projectId/comments` and removing unauthorized editing.
  - Updated `useAdminCommentsList` to require `projectId` and implemented client-side `isOfficial` filtering.
  - Removed `useUpdateComment` and `useMarkCommentOfficial` as admins cannot edit other users’ comments on the backend.
  - Rewired `useDeleteComment` to use correct nested routes.
  - Replaced non-existent bulk delete endpoint with sequential individual `DELETE` calls in `useDeleteCommentsBulk`.
  - Updated `AdminCommentsTab` UI to require project selection and removed all edit/official-toggle functionality.
- **Admin Updates**: Fixed broken `/updates` endpoints by nesting them under `/projects/:projectId/updates`.
  - Updated `useAdminUpdatesList` to require `projectId` and disable query when none is selected.
  - Rewired `useUpdateUpdate` and `useDeleteUpdate` to use correct nested routes.
  - Replaced non-existent bulk delete endpoint with sequential individual `DELETE` calls in `useDeleteUpdatesBulk`.
  - Updated `AdminUpdatesTab` UI to require project selection before displaying or modifying updates.

### Updated
- **Type Synchronization**: Synchronized frontend `User` and `Comment` types with backend data models.
  - Added `status` field to `User` interface.
  - Made `isOfficial` field mandatory in `Comment` interface.

## [Unreleased] - 2026-02-17

### Fixed
- **Dashboard DonutChart Error**: Fixed `ReferenceError: center is not defined` in Dashboard donut chart visualization by adding dynamic calculation of `center`, `radius`, and `strokeWidth` variables based on chart size.
- **Real-time Data Updates in MasonryFeed**: Fixed project cards not updating immediately after adding comments/reactions on project detail pages
  - **Root Cause**: Backend Redis cache invalidation pattern mismatch - reactions/comments invalidated cache using `projects:${projectId}:*` but actual cache keys use `projects:page=...` pattern
  - **Impact**: Frontend received stale data from Redis cache for up to 5 minutes after mutations
  - **Solution**: Backend cache invalidation pattern fixed from `projects:${projectId}:*` to `projects:*` to match actual cache keys
  - **Frontend Enhancements**: Added `refetchType: 'all'` to infinite query invalidations, `refetchOnWindowFocus: true`, and `staleTime: 0` to ensure all data is fresh
  - **Files Updated (Frontend)**:
    - `src/hooks/use-projects.ts` - Added refetch configuration
    - `src/hooks/use-comments.ts` - Added `refetchType: 'all'` and refetch settings
    - `src/hooks/use-reactions.ts` - Added `refetchType: 'all'` and refetch settings
  - **Files Updated (Backend)**:
    - `backend/src/modules/reactions/reactions.service.ts` - Fixed 8 cache invalidation calls
    - `backend/src/modules/comments/comments.service.ts` - Fixed 2 cache invalidation calls
  - **Result**: Project cards now show updated like/dislike/comment counts immediately after mutations
- Enhanced cache invalidation and refetch behavior across all project-related queries
- Fixed likes, dislikes, and comment counts in `ProjectCard` not updating in real-time when interacting with projects in the detail view
- Improved cache synchronization between project list (Masonry Feed) and project details by invalidating the public `projects` query key on relevant mutations
- Ensured admin project CRUD operations also invalidate the public project list for better consistency
- Updated `ApiProjectListItem` type to include `approveCount` and `disapproveCount`
- Updated `transformProjectListItem` to map reaction counts from API to project model

## [Unreleased] - 2026-02-16

### Added
- Admin Panel Phase 1 - Infrastructure
  - `AdminRoute` guard component for role-based access control (ADMIN, ASSISTANT_ADMIN only)
  - `AdminNavButton` component for TopBar navigation
  - `AdminPanel` main container with tabbed interface
  - Admin tab placeholders: Projects, Updates, Comments, Announcements, Contacts, Users
  - Sonner toast notifications for permission errors
  - Barrel exports via `components/admin/index.ts`

- Admin Panel Phase 2 - Data Hooks
  - `src/hooks/admin/types.ts` - Shared admin types (AdminListParams, AdminListResponse, BulkDeleteResponse, etc.)
  - `use-admin-projects.ts` - CRUD + bulk operations for projects
  - `use-admin-announcements.ts` - CRUD + bulk operations for announcements
  - `use-admin-contacts.ts` - CRUD + bulk operations for contacts
  - `use-admin-users.ts` - User management with role-based restrictions (ADMIN only)
  - `use-admin-comments.ts` - Comment moderation with official marking
  - `use-admin-updates.ts` - Project updates management
  - `src/hooks/admin/index.ts` - Barrel exports for all admin hooks

- Admin Panel Phase 3 - Shared Components
  - `AdminDataTable` - Glassmorphic data table with sorting, row selection, and pagination
  - `BulkActionBar` - Fixed bottom bar for bulk actions with animations
  - `ConfirmDialog` - Reusable confirmation modal with danger/default variants
  - `StatusBadge` - Color-coded badges for statuses, roles, and categories
  - `SearchFilterBar` - Search input with filters and Add New button
  - `ActionButtons` - Hover-reveal edit/delete buttons with tooltips
  - `AdminEmptyState` - Empty state component for admin views
  - `LoadingSkeleton` - Skeleton loading state for tables
  - `src/components/admin/shared/index.ts` - Barrel exports for shared components

- Admin Panel Phase 4 - Feature Tabs
  - `AdminProjectsTab` - Full CRUD for projects with filters and bulk delete
  - `AdminUpdatesTab` - Manage project updates with project linking
  - `AdminCommentsTab` - Comment moderation with edit, delete, and official toggle
  - `AdminAnnouncementsTab` - Full CRUD for announcements with rich text support
  - `AdminContactsTab` - Full CRUD for contacts with type filtering
  - `AdminUsersTab` - User management with role/status changes (ADMIN only)
  - Form components: `ProjectForm`, `AnnouncementForm`, `ContactForm`, `UpdateForm`, `UserEditDialog`
  - All tabs include: search, filters, pagination, bulk operations, toast notifications

- Admin Panel Phase 5 - Form Components & Validation
  - `CommentEditDialog` - Edit comment content and toggle official status with author/project context display
  - `validation.ts` - Comprehensive Zod validation schemas for all forms:
    - `projectSchema` - Project form validation with title, description, status, category, cost, dates
    - `announcementSchema` - Announcement validation with content HTML check, excerpt max 200 chars
    - `contactSchema` - Contact validation with type, phone numbers array, email array validation
    - `updateSchema` - Update validation with project selection and title/description
    - `userEditSchema` - User role/status validation with barangay conditional
    - `commentEditSchema` - Comment edit validation with content and isOfficial flag
  - `Label` UI component - @radix-ui/react-label based form label component
  - Form helper utilities: `validateForm()`, `getFieldError()`
  - Updated `forms/index.ts` barrel exports with all form components, types, and validation schemas

- Admin Panel Phase 6 - Polish, Error Handling & Performance
  - Error Handling & Retry Logic:
    - `utils.ts` - Error handling utilities with `ApiError` class, user-friendly error messages, and retry configuration
    - Enhanced all admin hooks with try-catch blocks and `handleApiError()` for consistent error handling
    - `createRetryConfig()` - Smart retry logic that only retries retryable errors (5xx, 429)
    - Updated all hooks: `use-admin-projects.ts`, `use-admin-announcements.ts`, `use-admin-contacts.ts`, `use-admin-users.ts`, `use-admin-comments.ts`, `use-admin-updates.ts`
  - React Query Performance Optimization:
    - `staleTime: 2 minutes` - Reduces unnecessary refetches
    - `gcTime: 5 minutes` - Keeps data in cache longer for better UX
    - `refetchOnWindowFocus: false` - Prevents jarring data refreshes
    - Detail queries use `staleTime: 5 minutes` for better caching
  - Error Boundary Component:
    - `ErrorBoundary.tsx` - React error boundary with fallback UI, error details in development, retry and home navigation buttons
    - `ErrorFallback` component for simpler error states
    - Exported via `shared/index.ts`
  - Enhanced Loading States:
    - `LoadingSkeleton` now supports multiple variants: 'table', 'cards', 'form'
    - Cards variant for card-based layouts
    - Form variant for dialog/form loading states
    - `Skeleton` UI component created
  - Keyboard Navigation & Accessibility:
    - `use-keyboard-shortcuts.ts` - Keyboard navigation hook with shortcuts:
      - `/` - Focus search input
      - `n` - Open create dialog
      - `esc` - Close dialog
      - `ctrl/cmd + enter` - Submit form
    - `useDialogFocus()` - Focus trap for dialogs with proper focus management
    - `useLiveAnnouncer()` - Screen reader announcements for dynamic content changes
  - Utility Functions:
    - `debounce()` - Debounce function for search inputs
    - `throttle()` - Throttle function for performance-critical operations
    - `formatErrorMessage()` - Consistent error message formatting
  - Updated `hooks/admin/index.ts` to export error handling utilities

## [1.0.0] - 2026-02-16

### Added
- Initial release of the Ormoc City Project Tracking System (Ormoc PIS) Frontend.
- React + TypeScript + Vite stack.
- Modern UI with Tailwind CSS and Radix UI.
- Responsive design for mobile and desktop.
- Interactive dashboard for residents and officials.
- User authentication (Login/Signup).
- Real-time project updates with Socket.io.
- Map integration (Google Maps/Leaflet) for project locations.
- Form handling with React Hook Form.
- State management with TanStack Query.
