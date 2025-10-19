# Project Structure Documentation

This document explains the folder structure and organization of the MetaaLearn Admin Panel.

## Directory Tree

```
metaalearn-panel/
├── public/                    # Static assets
│   └── vite.svg              # Vite logo
│
├── src/                      # Source code
│   ├── assets/               # Asset files
│   │   ├── images/          # Images
│   │   └── icons/           # Custom icons
│   │
│   ├── components/           # React components
│   │   ├── common/          # Shared components
│   │   │   ├── PageHeader.tsx        # Page header with breadcrumbs
│   │   │   ├── PermissionGuard.tsx   # Permission-based rendering
│   │   │   ├── ProtectedRoute.tsx    # Protected route wrapper
│   │   │   └── index.ts              # Exports
│   │   │
│   │   └── ui/              # UI components (shadcn/magic ui)
│   │
│   ├── config/              # Configuration files
│   │   ├── env.config.ts    # Environment variables
│   │   ├── query.config.ts  # React Query configuration
│   │   └── index.ts         # Exports
│   │
│   ├── constants/           # Application constants
│   │   ├── routes.ts        # Route path constants
│   │   ├── menu.ts          # Menu configuration
│   │   └── index.ts         # Exports
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── usePermissions.ts # Permission checking hook
│   │   └── index.ts         # Exports
│   │
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.tsx   # Main app layout with sidebar
│   │   ├── AuthLayout.tsx   # Authentication pages layout
│   │   └── index.ts         # Exports
│   │
│   ├── pages/               # Page components
│   │   ├── auth/           # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── DashboardPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── users/          # User management pages
│   │   │   ├── UsersPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── courses/        # Course management pages
│   │   │   ├── CoursesPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── settings/       # Settings pages
│   │       ├── SettingsPage.tsx
│   │       └── index.ts
│   │
│   ├── router/             # Routing configuration
│   │   └── index.tsx       # Router setup with all routes
│   │
│   ├── services/           # API services
│   │   ├── http.service.ts # HTTP client (Axios wrapper)
│   │   ├── auth.service.ts # Authentication API calls
│   │   └── index.ts        # Exports
│   │
│   ├── store/              # State management (Zustand)
│   │   ├── auth.store.ts   # Authentication state
│   │   └── index.ts        # Exports
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── auth.types.ts   # Auth-related types
│   │   ├── user.types.ts   # User-related types
│   │   ├── route.types.ts  # Route-related types
│   │   ├── common.types.ts # Common types
│   │   └── index.ts        # Exports
│   │
│   ├── utils/              # Utility functions
│   │   ├── storage.ts      # LocalStorage utilities
│   │   ├── permissions.ts  # Permission checking utilities
│   │   ├── format.ts       # Formatting utilities
│   │   └── index.ts        # Exports
│   │
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles (Tailwind)
│   └── vite-env.d.ts       # Vite environment types
│
├── .env                    # Environment variables
├── .env.example            # Environment variables template
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # TypeScript config for Node
├── vite.config.ts          # Vite configuration
├── README.md               # Main documentation
├── QUICKSTART.md           # Quick start guide
├── DEMO.md                 # Demo and testing guide
└── PROJECT_STRUCTURE.md    # This file
```

## Key Files Explained

### Configuration Files

#### `vite.config.ts`
- Configures Vite build tool
- Sets up path aliases (@, @/components, etc.)
- Configures dev server port

#### `tailwind.config.js`
- Tailwind CSS configuration
- Custom color palette
- Content paths for purging

#### `tsconfig.json`
- TypeScript compiler options
- Path aliases configuration
- Strict type checking enabled

### Source Code Organization

#### `src/constants/`
All constants are centralized here:
- **routes.ts**: All route paths as constants (no magic strings!)
- **menu.ts**: Sidebar menu structure with icons and permissions

#### `src/types/`
TypeScript type definitions:
- **auth.types.ts**: User, Login, Permissions, Roles
- **user.types.ts**: User profile and management types
- **route.types.ts**: Route configuration types
- **common.types.ts**: API responses, pagination, filters

#### `src/services/`
API layer:
- **http.service.ts**: Axios wrapper with interceptors
  - Automatically adds auth tokens
  - Handles token refresh
  - Error handling and notifications
- **auth.service.ts**: Authentication endpoints
  - Login, logout, register
  - Profile management
  - Password reset

#### `src/store/`
State management with Zustand:
- **auth.store.ts**: Authentication state
  - User info
  - Tokens
  - Persistence

#### `src/hooks/`
Custom React hooks:
- **useAuth.ts**: Authentication operations
  - login(), logout(), register()
  - User state and loading state
- **usePermissions.ts**: Permission checking
  - can(), canAny(), canAll()
  - isRole(), isSuperAdmin(), isAdmin()

#### `src/components/common/`
Shared components:
- **ProtectedRoute.tsx**: Wraps routes requiring auth/permissions
- **PermissionGuard.tsx**: Conditionally renders based on permissions
- **PageHeader.tsx**: Page title and breadcrumbs

#### `src/layouts/`
Layout components:
- **MainLayout.tsx**: Main app with sidebar and header
- **AuthLayout.tsx**: Centered layout for login/register

#### `src/utils/`
Utility functions:
- **storage.ts**: LocalStorage helpers
- **permissions.ts**: Permission checking logic
- **format.ts**: Date, number, currency formatting

## Path Aliases

The project uses path aliases for clean imports:

```typescript
// Instead of: import { Button } from '../../../components/ui/Button'
import { Button } from '@/components/ui/Button';

// Available aliases:
'@/*'           // src/*
'@/components/*' // src/components/*
'@/pages/*'      // src/pages/*
'@/layouts/*'    // src/layouts/*
'@/hooks/*'      // src/hooks/*
'@/store/*'      // src/store/*
'@/services/*'   // src/services/*
'@/utils/*'      // src/utils/*
'@/types/*'      // src/types/*
'@/constants/*'  // src/constants/*
'@/config/*'     // src/config/*
```

## Design Patterns

### 1. Centralized Constants
All routes and menu items are defined as constants to avoid typos and make refactoring easier.

### 2. Service Layer
All API calls go through the service layer, making it easy to:
- Mock for development
- Add caching
- Handle errors consistently
- Add logging

### 3. Custom Hooks
Business logic is extracted into custom hooks:
- Easier to test
- Reusable across components
- Cleaner component code

### 4. Permission-Based UI
Use `PermissionGuard` and `ProtectedRoute` to control access:
- Declarative permissions
- No permission logic in components
- Easy to maintain

### 5. Type Safety
Full TypeScript coverage:
- Catch errors at compile time
- Better IDE support
- Self-documenting code

## Adding New Features

### Add a New Page

1. Create page component in `src/pages/your-feature/`
2. Create route constant in `src/constants/routes.ts`
3. Add route in `src/router/index.tsx`
4. Add menu item in `src/constants/menu.ts` (if needed)
5. Add permissions in `src/types/auth.types.ts` (if needed)

### Add a New API Service

1. Create service file in `src/services/your-feature.service.ts`
2. Use `httpService` for HTTP calls
3. Export service in `src/services/index.ts`
4. Create types in `src/types/your-feature.types.ts`

### Add a New Store

1. Create store file in `src/store/your-feature.store.ts`
2. Use Zustand's `create` function
3. Export store in `src/store/index.ts`
4. Optionally add persistence

## Best Practices

1. **Always use path aliases** - `@/` instead of relative paths
2. **Keep components small** - Split into smaller components
3. **Extract logic to hooks** - Keep components clean
4. **Use TypeScript strictly** - Don't use `any`
5. **Centralize constants** - No magic strings
6. **Handle errors** - Use try/catch and show user-friendly messages
7. **Add loading states** - Better UX
8. **Test permissions** - Ensure RBAC works correctly

## Environment Variables

All environment variables are prefixed with `VITE_`:

```env
VITE_API_BASE_URL      # Backend API URL
VITE_API_TIMEOUT       # Request timeout
VITE_APP_NAME          # Application name
VITE_APP_VERSION       # Version number
VITE_TOKEN_KEY         # LocalStorage key for token
VITE_REFRESH_TOKEN_KEY # LocalStorage key for refresh token
VITE_NODE_ENV          # Environment (development/production)
```

Access them via:
```typescript
import { env } from '@/config';
console.log(env.apiBaseUrl);
```

## Build Output

Production build creates:
- `dist/index.html` - Entry HTML
- `dist/assets/*.css` - Compiled CSS
- `dist/assets/*.js` - Compiled JavaScript

The build is optimized and minified for production.
