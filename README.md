# MetaaLearn Admin Panel

A modern, scalable admin panel built for MetaaLearn programming academy.

## Tech Stack

- **React 18** with **Vite** - Fast development and build tool
- **TypeScript** - Type safety and better developer experience
- **React Router v6** - Client-side routing
- **React Query** - Powerful data fetching and caching
- **Ant Design** - Enterprise-grade UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful, consistent icons
- **Axios** - HTTP client

## Features

- **Role-Based Access Control (RBAC)** - Fine-grained permission system
- **Authentication** - Secure login/logout with token management
- **Responsive Design** - Works on all screen sizes
- **Scalable Architecture** - Well-organized folder structure
- **Type Safety** - Full TypeScript support
- **Path Aliases** - Clean imports with @ prefix
- **Environment Configuration** - Easy configuration management

## Folder Structure

```
src/
├── components/      # Reusable components
│   ├── common/      # Common components (ProtectedRoute, PermissionGuard, etc.)
│   └── ui/          # UI components
├── config/          # Configuration files
├── constants/       # Constants (routes, menu items, etc.)
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
├── pages/           # Page components
├── router/          # Router configuration
├── services/        # API services
├── store/           # Zustand stores
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_APP_NAME=MetaaLearn Admin Panel
VITE_APP_VERSION=0.0.1
VITE_TOKEN_KEY=metaalearn_token
VITE_REFRESH_TOKEN_KEY=metaalearn_refresh_token
VITE_NODE_ENV=development
```

## Authentication

The application uses token-based authentication with the following flow:

1. User logs in with email and password
2. Server returns access token and refresh token
3. Access token is attached to all API requests
4. Refresh token is used to get a new access token when it expires
5. Tokens are stored in Zustand store with persistence

## Role-Based Access Control (RBAC)

### User Roles

- **SUPER_ADMIN** - Full access to all features
- **ADMIN** - Administrative access
- **MODERATOR** - Moderation capabilities
- **TEACHER** - Teacher-specific features
- **STUDENT** - Student-specific features

### Permissions

Permissions are defined in `src/types/auth.types.ts`:

- `USER_VIEW`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
- `COURSE_VIEW`, `COURSE_CREATE`, `COURSE_UPDATE`, `COURSE_DELETE`
- `SETTINGS_VIEW`, `SETTINGS_UPDATE`
- `DASHBOARD_VIEW`, `ANALYTICS_VIEW`

### Using Permissions

#### Protect Routes

```tsx
<ProtectedRoute permissions={[Permission.USER_VIEW]}>
  <UsersPage />
</ProtectedRoute>
```

#### Conditional Rendering

```tsx
<PermissionGuard permissions={Permission.USER_CREATE}>
  <Button>Create User</Button>
</PermissionGuard>
```

#### In Hooks

```tsx
const { can } = usePermissions();

if (can(Permission.USER_DELETE)) {
  // Show delete button
}
```

## Routes

All routes are defined as constants in `src/constants/routes.ts`:

```typescript
import { ROUTES } from '@/constants';

// Usage
navigate(ROUTES.USERS.LIST);
navigate(generatePath(ROUTES.USERS.EDIT, { id: '123' }));
```

## Custom Hooks

### useAuth

```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

### usePermissions

```tsx
const { can, canAny, canAll, isRole, isSuperAdmin, isAdmin } = usePermissions();
```

## API Services

All API calls are centralized in the `services` folder:

```typescript
import { authService } from '@/services';

// Login
const response = await authService.login({ email, password });

// Get profile
const user = await authService.getProfile();
```

## State Management

The app uses Zustand for state management. Stores are located in `src/store/`:

```typescript
import { useAuthStore } from '@/store';

const { user, token, setAuth, clearAuth } = useAuthStore();
```

## Styling

The app uses Tailwind CSS with Ant Design:

- Use Tailwind utility classes for custom styling
- Use Ant Design components for UI elements
- Theme configuration is in `src/App.tsx`

## Path Aliases

The following path aliases are configured:

- `@/*` - src/*
- `@/components/*` - src/components/*
- `@/pages/*` - src/pages/*
- `@/layouts/*` - src/layouts/*
- `@/hooks/*` - src/hooks/*
- `@/store/*` - src/store/*
- `@/services/*` - src/services/*
- `@/utils/*` - src/utils/*
- `@/types/*` - src/types/*
- `@/constants/*` - src/constants/*
- `@/config/*` - src/config/*

## Next Steps

To continue development:

1. **Connect to Backend API** - Update API base URL in `.env`
2. **Add More Pages** - Create components in `src/pages/`
3. **Implement Features** - Add courses, students, teachers management
4. **Add Tests** - Set up testing framework
5. **Configure CI/CD** - Set up deployment pipeline

## License

Private - MetaaLearn Academy
