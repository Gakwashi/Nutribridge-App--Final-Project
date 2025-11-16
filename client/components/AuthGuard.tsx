import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const publicRoutes = ['/login', '/signup', '/about', '/privacy', '/terms'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If user is not logged in and trying to access protected route
    if (!user && !publicRoutes.includes(router.pathname)) {
      router.push('/login');
      return;
    }

    // If user is logged in and trying to access auth pages
    if (user && (router.pathname === '/login' || router.pathname === '/signup')) {
      router.push('/');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to public routes without auth
  if (!user && publicRoutes.includes(router.pathname)) {
    return <>{children}</>;
  }

  // Allow access to all routes if user is authenticated
  if (user) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}