# Trego Dashboard Layout - Implementation Guide

## Overview

The Trego dashboard uses a **hybrid navigation layout** combining a persistent sidebar for main navigation and a top bar for global actions. This design provides excellent scalability for future multi-role expansion (players, coaches, teams, clubs) while maintaining a clean, professional interface.

## Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [TopBar: Search, Notifications, Profile]                    │ ← Global Actions
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │  Main Content Area (Outlet)                      │
│ (240px)  │  - Dashboard                                      │
│          │  - Browse                                         │
│          │  - Games                                          │
│          │  - Teams                                          │
│          │  - Messages                                       │
│          │  - Profile                                        │
└──────────┴──────────────────────────────────────────────────┘
```

### Component Hierarchy

```
_authed.tsx (Layout Wrapper)
├── Sidebar (Desktop: Fixed, Mobile: Drawer)
│   ├── Logo/Brand
│   ├── NavigationItems
│   └── Settings Link
├── TopBar
│   ├── Mobile Menu Button
│   ├── Logo (Mobile only)
│   ├── Search Bar
│   ├── Notifications Dropdown
│   └── Profile Dropdown
└── Main Content (Outlet)
    └── Dashboard / Other Routes
```

## Components

### 1. Layout Wrapper (`_authed.tsx`)

**Purpose**: Main authenticated layout wrapper that provides the structure for all authenticated routes.

**Features**:

- Authentication guard (redirects to `/login` if not authenticated)
- Manages mobile drawer state
- Provides consistent layout structure
- Uses TanStack Router's `Outlet` for nested routes

**Responsive Behavior**:

- Desktop: Fixed sidebar + top bar + main content
- Mobile: Drawer overlay for sidebar, top bar always visible

### 2. Sidebar Component (`components/layout/sidebar.tsx`)

**Purpose**: Primary navigation component for desktop view.

**Features**:

- Fixed positioning on desktop (240px width)
- Active route highlighting using `useMatchRoute`
- Icon-based navigation with labels
- Logo/brand at top
- Settings link at bottom
- Hidden on mobile (replaced by drawer)

**Navigation Items**:

- Dashboard (`/dashboard`)
- Browse (`/browse`)
- My Games (`/games`)
- My Teams (`/teams`)
- Messages (`/messages`)
- Profile (`/profile`)

**Design Decisions**:

- Uses `NavigationItems` component for reusability (shared with mobile drawer)
- Prepared structure for role-based sections (coach, team admin, etc.)
- Smooth hover transitions
- Active state uses accent background

### 3. TopBar Component (`components/layout/topbar.tsx`)

**Purpose**: Global actions bar with search, notifications, and user profile.

**Features**:

- Sticky positioning (always visible)
- Search bar (placeholder for future implementation)
- Notifications dropdown with badge count
- Profile dropdown with user avatar
- Mobile hamburger menu trigger
- Logo on mobile only (desktop has it in sidebar)

**User Data**:

- Fetches user data via `$getUserData` server function
- Displays user avatar with fallback initials
- Shows user name and email in profile dropdown

**Notifications**:

- Uses mock data (`mockNotifications`)
- Badge shows unread count
- Dropdown displays notification list with read/unread indicators

### 4. Mobile Drawer (`_authed.tsx` + `@9ui/drawer`)

**Purpose**: Mobile navigation overlay.

**Features**:

- Slides in from left on mobile
- Contains same navigation as desktop sidebar
- Closes on navigation item click
- Uses `@9ui/drawer` component
- Triggered by hamburger menu in TopBar

### 5. Dashboard Card Component (`components/layout/dashboard-card.tsx`)

**Purpose**: Reusable card component for dashboard widgets.

**Features**:

- Extends `@9ui/card` component
- Supports icon, title, description
- Optional action button
- Hover effects for interactivity
- Consistent styling across dashboard

## Dashboard Page

### Structure (`routes/_authed/dashboard.tsx`)

The dashboard home page consists of:

1. **Page Header**
   - Title: "Dashboard"
   - Subtitle: Welcome message

2. **Quick Actions Section** (3 cards in grid)
   - Find a Game
   - Find Teammates
   - Post Availability

3. **Upcoming This Week** (Left column)
   - List of scheduled games
   - Game details: sport, date, time, location, teams
   - Status badges (pending, upcoming)
   - "View All Games" button

4. **Recommended For You** (Right column)
   - Personalized recommendations
   - Types: Team, Player, Game
   - Match score percentage
   - Location and sport tags
   - "Browse More" button

5. **Recent Activity Feed** (Full width)
   - Activity stream from network
   - Types: game invites, team requests, player posts, game posts
   - Timestamps and sport tags
   - Icon-based type indicators

### Mock Data Structure

All dashboard content uses mock data defined in `lib/mock-data.ts`:

**MockGame**:

```typescript
{
  id: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  teamName?: string;
  opponent?: string;
  status: "upcoming" | "pending" | "completed";
}
```

**MockRecommendation**:

```typescript
{
  id: string;
  type: "team" | "player" | "game";
  title: string;
  description: string;
  sport: string;
  location?: string;
  matchScore?: number;
}
```

**MockActivity**:

```typescript
{
  id: string;
  type: "game_invite" | "team_request" | "player_post" | "game_post";
  title: string;
  description: string;
  timestamp: string;
  sport?: string;
}
```

**MockNotification**:

```typescript
{
  id: string;
  type: "invite" | "request" | "message" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
```

## Responsive Design

### Desktop (≥768px)

- **Sidebar**: Fixed left position, 240px width, always visible
- **TopBar**: Full width, no logo (logo in sidebar)
- **Main Content**: Left margin 240px (`md:pl-60`)
- **Layout**: Side-by-side columns for dashboard widgets

### Mobile (<768px)

- **Sidebar**: Hidden, replaced by drawer overlay
- **TopBar**: Full width, includes logo and hamburger menu
- **Main Content**: Full width, no left margin
- **Drawer**: Slides in from left when hamburger clicked
- **Layout**: Single column stack for dashboard widgets

### Breakpoints

- Uses Tailwind's `md:` breakpoint (768px)
- Mobile-first approach
- Smooth transitions for sidebar/drawer

## UI Components Used

All components from **@9ui registry**:

- `@9ui/avatar` - User profile pictures
- `@9ui/dropdown-menu` - Profile and notifications menus
- `@9ui/badge` - Notification counts and status indicators
- `@9ui/separator` - Visual dividers
- `@9ui/drawer` - Mobile navigation overlay
- `@9ui/card` - Dashboard widgets and content cards
- `@9ui/button` - Interactive elements
- `@9ui/tooltip` - Hover labels (optional)

## Design Principles

### 1. Scalability

- Navigation structure supports adding role-based sections
- Component architecture allows easy extension
- Mock data structure mirrors future database schema

### 2. Consistency

- Unified design system via @9ui components
- Consistent spacing and typography
- Reusable components (DashboardCard, NavigationItems)

### 3. Accessibility

- Proper ARIA labels
- Keyboard navigation support (via @9ui components)
- Screen reader friendly
- Focus management

### 4. Performance

- Components memoized where appropriate
- Server-side data fetching for user info
- Efficient re-renders

## Future Expansion

### Role-Based Navigation

The sidebar structure is designed to support role-based sections:

```typescript
// Future: Role-based navigation
const playerNav = [...]; // Current items
const coachNav = [
  { icon: GraduationCap, label: "My Lessons", path: "/coach/lessons" },
  { icon: Users, label: "Students", path: "/coach/students" },
  // ...
];
const teamAdminNav = [
  { icon: Users, label: "Roster", path: "/team/roster" },
  { icon: Calendar, label: "Schedule", path: "/team/schedule" },
  // ...
];
```

### Additional Features

1. **Search Functionality**
   - Currently placeholder
   - Will search games, teams, players
   - Global search in TopBar

2. **Real-Time Notifications**
   - Replace mock data with WebSocket/SSE
   - Real-time badge updates
   - Notification preferences

3. **Dashboard Customization**
   - User-configurable widgets
   - Drag-and-drop layout
   - Show/hide sections

4. **Mobile App**
   - Same component structure
   - Native navigation patterns
   - Push notifications

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx          # Desktop sidebar navigation
│   │   ├── topbar.tsx           # Global top bar
│   │   └── dashboard-card.tsx   # Reusable dashboard widget
│   └── ui/                      # @9ui components
├── routes/
│   └── _authed.tsx              # Layout wrapper
│       └── dashboard.tsx        # Dashboard home page
├── lib/
│   ├── user.ts                  # User data server function
│   └── mock-data.ts             # Mock data for dashboard
└── db/
    └── tables.ts                # Database schema
```

## Styling

- **Framework**: Tailwind CSS
- **Design System**: @9ui components (New York style)
- **Theme**: Supports light/dark mode (via CSS variables)
- **Icons**: Lucide React
- **Typography**: Inter font family

## Key Features

✅ Hybrid navigation (sidebar + top bar)
✅ Responsive mobile drawer
✅ Active route highlighting
✅ User profile integration
✅ Notification system (mock)
✅ Dashboard widgets with mock data
✅ Scalable architecture
✅ Accessible components
✅ Consistent design system

## Next Steps

1. Implement real search functionality
2. Connect dashboard widgets to real data
3. Add real-time notifications
4. Implement role-based navigation
5. Add dashboard customization
6. Create remaining routes (Browse, Games, Teams, Messages, Profile)
7. Add loading states and error handling
8. Implement user preferences
