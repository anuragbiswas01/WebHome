import { Outlet, createRootRoute } from '@tanstack/react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { BookmarksProvider } from '../contexts/BookmarksContext';
import { useTheme } from '../hooks/useTheme';

export const Route = createRootRoute({
  component: RootLayout,
});

function GlobalThemeApplier() {
  // Keeps theme and custom primary color synchronized across all routes
  useTheme();
  return null;
}

function RootLayout() {
  return (
    <AuthProvider>
      <BookmarksProvider>
        <GlobalThemeApplier />
        <Outlet />
      </BookmarksProvider>
    </AuthProvider>
  );
}
