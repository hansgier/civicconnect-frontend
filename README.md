# Ormoc City Project Tracking System (Frontend)

Frontend application for the Ormoc City Project Tracking System (Ormoc PIS), built with React 19, TypeScript, Vite, and Tailwind CSS.

## Overview

This application provides an interactive interface for Ormoc City residents and officials to track, manage, and discuss local infrastructure projects. It features a responsive dashboard, real-time updates, comprehensive admin panel, and modern UI components.

## Features

### Public Features

- **Interactive Dashboard**: Real-time project statistics with charts and trends
- **Project Feed**: Masonry-style project listing with infinite scroll
- **Project Details**: Detailed view with updates, comments, and reactions
- **Search & Filter**: Advanced filtering by barangay, status, category, and date
- **User Authentication**: Login, registration, and social OAuth (Google, Facebook)
- **Comments & Reactions**: Community engagement with likes/dislikes and discussions
- **Emergency Contacts**: Quick access to city emergency hotlines
- **Responsive Design**: Mobile-first approach with desktop optimization

### Admin Panel

- **Role-based Access**: ADMIN and ASSISTANT_ADMIN roles
- **Full CRUD Operations**: Manage projects, announcements, contacts, users
- **Rich Text Editor**: TipTap-powered editor for project descriptions and announcements
- **Bulk Actions**: Select and delete multiple items at once
- **Data Tables**: Sortable, filterable tables with pagination
- **Project Updates**: Manage project progress updates
- **Comment Moderation**: Moderate user comments and mark official responses

## Tech Stack

- **Framework**: React 19.2+
- **Build Tool**: Vite 7.2+
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS 4.1+
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query (React Query) 5.90+
- **Routing**: React Router 7.13+
- **Forms**: React Hook Form with Zod validation
- **Animations**: Motion (Framer Motion successor)
- **Icons**: Lucide React
- **Date Handling**: date-fns, react-day-picker
- **Rich Text**: TipTap editor
- **Toast Notifications**: Sonner

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- Backend API running (see backend README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env.local` file:
   ```env
   VITE_API_URL="http://localhost:5000/api/v1"
   VITE_SOCKET_URL="http://localhost:5000"
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Structure

```
frontend/app/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin panel components
│   │   │   ├── shared/     # Shared admin components (tables, dialogs)
│   │   │   ├── forms/      # Form components (ProjectForm, etc.)
│   │   │   └── tabs/       # Admin panel tabs (Projects, Users, etc.)
│   │   └── ui/             # Reusable UI components (Button, Input, etc.)
│   ├── hooks/              # Custom React hooks
│   │   ├── admin/          # Admin-specific hooks
│   │   └── use-*.ts        # Feature hooks (use-projects, use-auth, etc.)
│   ├── lib/                # Utility functions and helpers
│   ├── pages/              # Page components
│   ├── sections/           # Section components (Dashboard, Feed, etc.)
│   ├── styles/             # Global styles and Tailwind config
│   ├── types/              # TypeScript type definitions
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
└── index.html              # HTML template
```

## Key Components

### UI Components

Located in `src/components/ui/`, built on Radix UI primitives:

- `Button` - Primary, secondary, ghost, and glass variants
- `Input` - Text inputs with custom focus states
- `Select` - Dropdown selects with Radix UI
- `Dialog` - Modal dialogs with focus management
- `Card` - Content containers with consistent styling
- `Badge` - Status indicators with color coding
- `Avatar` - User profile pictures
- `Tabs` - Tab navigation
- `Toast` - Notification system via Sonner
- `Skeleton` - Loading state placeholders
- `DatePicker` - Custom calendar date picker

### Admin Components

- `AdminDataTable` - Glassmorphic data table with sorting and selection
- `BulkActionBar` - Fixed bottom bar for bulk operations
- `ConfirmDialog` - Reusable confirmation modal
- `StatusBadge` - Color-coded status indicators
- `SearchFilterBar` - Search with filters
- `LoadingSkeleton` - Multi-variant loading states
- `ErrorBoundary` - Error handling with fallback UI

### Form Components

- `ProjectForm` - Create/edit projects with validation
- `AnnouncementForm` - Rich text announcement editor
- `ContactForm` - Contact management form
- `UpdateForm` - Project update editor
- `CommentEditDialog` - Comment moderation dialog

## State Management

### TanStack Query (React Query)

Used for server state management with the following configuration:

- **Stale Time**: 2 minutes for lists, 5 minutes for details
- **Cache Time**: 5 minutes
- **Refetch**: On window focus disabled for smoother UX
- **Retry**: Smart retry logic for transient errors

### Key Hooks

- `useProjects` - Project listing with infinite scroll
- `useProject` - Single project details
- `useDashboard` - Dashboard statistics and trends
- `useAuth` - Authentication state and operations
- `useComments` - Comment CRUD operations
- `useReactions` - Like/dislike functionality
- `useAdminProjects` - Admin project management
- `useAdminUsers` - User management (admin only)

## Routing

Routes are defined in `src/main.tsx` using React Router:

- `/` - Home page with dashboard and feed
- `/login` - User login
- `/register` - User registration
- `/projects/:id` - Project detail page
- `/admin` - Admin panel (protected, admin only)
- `/contacts` - Emergency contacts page
- `/announcements` - Public announcements

## Styling

### Tailwind CSS 4.1

- **Custom Theme**: Extended with brand colors (Coral, Electric Blue)
- **Dark Mode**: Full dark mode support via CSS variables
- **Components**: Consistent `rounded-2xl`, `rounded-xl` border radius
- **Glassmorphism**: `backdrop-blur-md`, `backdrop-blur-xl` for premium effects
- **Responsive**: Mobile-first breakpoints

### Design System

- **Colors**: Primary (coral), Secondary (electric blue), Success, Warning, Error
- **Typography**: Modern sans-serif stack with proper hierarchy
- **Spacing**: Consistent 4px grid system
- **Elevation**: Subtle shadows with hover lift effects

## Forms & Validation

### Zod Schemas

All forms use Zod for validation:

```typescript
// Example: Project validation
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['ongoing', 'completed', 'planned', ...]),
  category: z.string(),
  cost: z.number().optional(),
  startDate: z.date().optional(),
  // ...
});
```

### Form Features

- Real-time validation
- Error message display
- Field-level validation
- Cross-field validation
- File upload support

## Real-time Features

Socket.io integration for real-time updates:

- **Project Updates**: Live update notifications
- **Comments**: Real-time comment additions
- **Reactions**: Instant like/dislike updates
- **Dashboard**: Live statistics refresh

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Lazy loading with blur placeholders
- **Query Caching**: Aggressive caching with TanStack Query
- **Virtualization**: Efficient list rendering for large datasets
- **Debouncing**: 500ms debounce on search inputs
- **Memoization**: Strategic use of useMemo and useCallback

## Accessibility

- **Keyboard Navigation**: Full keyboard support with shortcuts
  - `/` - Focus search
  - `n` - Open create dialog
  - `esc` - Close dialog
  - `ctrl/cmd + enter` - Submit form
- **Focus Management**: Focus traps in dialogs
- **Screen Readers**: Live announcements for dynamic content
- **ARIA Labels**: Proper labeling for screen readers
- **Color Contrast**: WCAG compliant color ratios

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_SOCKET_URL` | Socket.io server URL | Yes |

## Recent Changes

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### Latest Updates (v1.0.0)

- **Dashboard**: Interactive charts, status trends, grouped bar charts
- **Admin Panel**: Full CRUD with rich text editor, bulk actions
- **UI Overhaul**: Premium components with glassmorphism, modern aesthetics
- **Real-time**: Socket.io integration for live updates
- **Performance**: Query optimization, caching, debouncing
- **Code Quality**: Resolved 46+ ESLint errors, TypeScript strict mode
- **Accessibility**: Keyboard shortcuts, focus management, screen reader support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Code Style

- Follow existing TypeScript patterns
- Use Tailwind CSS for styling (no inline styles)
- Ensure ESLint passes: `npm run lint`
- Write semantic HTML
- Add proper TypeScript types

## License

ISC

## Support

For issues or questions, please open an issue in the project repository.

## Links

- [Backend Documentation](../backend/README.md)
- [Changelog](./CHANGELOG.md)
