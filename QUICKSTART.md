# Quick Start Guide

Get the MetaaLearn Admin Panel up and running in 5 minutes!

## Prerequisites

Make sure you have Node.js 18+ installed:

```bash
node --version
```

## Step 1: Install Dependencies

Dependencies are already installed! If you need to reinstall:

```bash
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Step 3: Login

The app is configured with **mock authentication** for development.

**Login with any credentials:**
- Email: `any@email.com` (or any email)
- Password: `password123` (or any password)

You'll be logged in as a Super Admin with all permissions!

## What's Next?

### 1. Explore the Features

- ✅ **Dashboard** - View statistics and overview
- ✅ **Users Management** - See the users table with RBAC
- ✅ **Courses** - Placeholder for course management
- ✅ **Settings** - Placeholder for settings
- ✅ **Responsive Sidebar** - Try collapsing the sidebar
- ✅ **User Menu** - Click your avatar in the top right

### 2. Test RBAC (Role-Based Access Control)

To test different permission levels:

1. Open `src/services/auth.service.ts`
2. Find the line `const USE_MOCK_AUTH = true;`
3. Scroll down to the mock user object
4. Change the `role` and `permissions` to test different access levels

**Example - Limited Teacher Access:**

```typescript
role: UserRole.TEACHER,
permissions: [
  Permission.DASHBOARD_VIEW,
  Permission.COURSE_VIEW,
  Permission.COURSE_UPDATE,
],
```

Logout and login again to see the changes!

### 3. Connect to Your Backend

When you're ready to connect to a real backend:

1. Open `src/services/auth.service.ts`
2. Change `const USE_MOCK_AUTH = true;` to `const USE_MOCK_AUTH = false;`
3. Update the API URL in `.env`:
   ```
   VITE_API_BASE_URL=http://your-backend-url/api
   ```

### 4. Customize the Theme

Edit theme colors in `src/App.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#0ea5e9', // Change this!
      borderRadius: 8,
    },
  }}
>
```

### 5. Add New Pages

1. Create a new page in `src/pages/your-feature/`
2. Add route in `src/router/index.tsx`
3. Add menu item in `src/constants/menu.ts`
4. Add permissions if needed in `src/types/auth.types.ts`

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Folder Structure Overview

```
src/
├── components/     # Reusable components
├── config/         # App configuration
├── constants/      # Routes, menu items, etc.
├── hooks/          # Custom React hooks
├── layouts/        # Layout components
├── pages/          # Page components
├── router/         # Route configuration
├── services/       # API services
├── store/          # State management (Zustand)
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Common Tasks

### Add a New Permission

1. Add to `src/types/auth.types.ts`:
   ```typescript
   export enum Permission {
     NEW_PERMISSION = 'new.permission',
   }
   ```

2. Use it in your components:
   ```tsx
   <PermissionGuard permissions={Permission.NEW_PERMISSION}>
     <Button>Only visible with permission</Button>
   </PermissionGuard>
   ```

### Protect a Route

```tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute permissions={[Permission.ADMIN_VIEW]}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Make API Calls with React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { httpService } from '@/services';

const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const response = await httpService.get('/users');
    return response.data;
  },
});
```

## Troubleshooting

**Problem:** Port 3000 is already in use

**Solution:** The dev server will automatically try port 3001, 3002, etc.

---

**Problem:** Can't login

**Solution:** Make sure `USE_MOCK_AUTH = true` in `src/services/auth.service.ts`

---

**Problem:** TypeScript errors

**Solution:** Run `npm install` to ensure all dependencies are installed

---

**Problem:** Build warnings about chunk size

**Solution:** This is normal. For optimization, you can implement code splitting later.

## Need Help?

- Check `README.md` for detailed documentation
- Check `DEMO.md` for testing guide
- Review the code - it's well-commented!

## Next Steps

1. ✅ Run the dev server
2. ✅ Login and explore
3. ✅ Test RBAC with different roles
4. 📝 Plan your features
5. 🚀 Start building!

Happy coding! 🎉
