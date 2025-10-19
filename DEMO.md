# Demo Guide

This guide explains how to test the MetaaLearn Admin Panel with demo data.

## Demo Credentials

Since the backend is not yet implemented, you can use these mock credentials for testing:

**Email:** `admin@metaalearn.com`
**Password:** `password123`

## Mock User Data

The application comes with mock authentication. When you log in, you'll be authenticated with a demo user that has the following properties:

```typescript
{
  id: "1",
  email: "admin@metaalearn.com",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.SUPER_ADMIN,
  permissions: [
    Permission.DASHBOARD_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.COURSE_VIEW,
    Permission.COURSE_CREATE,
    Permission.COURSE_UPDATE,
    Permission.COURSE_DELETE,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,
  ],
}
```

## Enabling Mock Authentication

To enable mock authentication for development (before connecting to backend):

1. Open `src/services/auth.service.ts`
2. Temporarily replace the login function with mock data:

```typescript
login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Mock login - Remove this when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-token-123',
        refreshToken: 'mock-refresh-token-123',
        user: {
          id: '1',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.SUPER_ADMIN,
          permissions: Object.values(Permission),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }, 1000); // Simulate network delay
  });
},
```

## Testing RBAC

To test role-based access control:

1. **Super Admin** - Has access to everything
2. **Admin** - Change `role: UserRole.ADMIN` and reduce permissions
3. **Teacher** - Change `role: UserRole.TEACHER` with only course-related permissions
4. **Student** - Change `role: UserRole.STUDENT` with view-only permissions

Example for testing limited permissions:

```typescript
// Teacher with limited access
user: {
  role: UserRole.TEACHER,
  permissions: [
    Permission.DASHBOARD_VIEW,
    Permission.COURSE_VIEW,
    Permission.COURSE_UPDATE,
  ],
}
```

## Features to Test

### 1. Authentication
- ✅ Login with email/password
- ✅ Logout
- ✅ Token persistence (refresh page and stay logged in)
- ✅ Protected routes (try accessing `/dashboard` without login)

### 2. Navigation
- ✅ Sidebar menu
- ✅ Collapsible sidebar
- ✅ Menu items based on permissions
- ✅ User dropdown menu

### 3. RBAC
- ✅ Route protection based on permissions
- ✅ Conditional rendering of UI elements
- ✅ Permission-based menu filtering

### 4. Pages
- ✅ Dashboard with statistics
- ✅ Users management table
- ✅ Courses page (placeholder)
- ✅ Settings page (placeholder)

### 5. Responsive Design
- ✅ Mobile view
- ✅ Tablet view
- ✅ Desktop view

## Known Limitations (To Be Implemented)

- [ ] Actual backend API integration
- [ ] User CRUD operations
- [ ] Course management
- [ ] Settings functionality
- [ ] Analytics charts
- [ ] File uploads
- [ ] Search and filters
- [ ] Pagination
- [ ] Data tables with sorting

## Troubleshooting

### Issue: Can't log in
**Solution:** Check that you've implemented the mock login function or that your backend API is running.

### Issue: Menu items not showing
**Solution:** Check that the user has the required permissions for those menu items.

### Issue: Getting redirected to login
**Solution:** Clear localStorage and try logging in again.

### Issue: TypeScript errors
**Solution:** Run `npm install` to ensure all dependencies are installed.

## Next Development Steps

1. **Backend Integration**
   - Replace mock auth with real API calls
   - Connect to your Laravel/Node.js backend
   - Implement proper error handling

2. **Feature Development**
   - Complete user management (create, edit, delete)
   - Implement course management
   - Add student enrollment
   - Build analytics dashboard

3. **UI/UX Improvements**
   - Add loading states
   - Implement notifications
   - Add confirmation dialogs
   - Improve error messages

4. **Testing**
   - Add unit tests
   - Add integration tests
   - Add E2E tests with Playwright

5. **Performance**
   - Implement code splitting
   - Add lazy loading for routes
   - Optimize bundle size
   - Add caching strategies
