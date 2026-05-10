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
- Backend API running

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