import { Outlet, createRootRoute } from '@tanstack/react-router';
import { AuthProvider } from '../contexts/AuthContext';
import { BookmarksProvider } from '../contexts/BookmarksContext';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <AuthProvider>
            <BookmarksProvider>
                <Outlet />
            </BookmarksProvider>
        </AuthProvider>
    );
}
