import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';

  // Get access token from session
  const getAccessToken = () => {
    return session?.accessToken || null;
  };

  // Get refresh token from session
  const getRefreshToken = () => {
    return session?.refreshToken || null;
  };

  // Check if user is verified
  const isVerified = session?.isVerified || false;

  // Redirect to login if not authenticated
  const requireAuth = (redirectTo: string = '/login') => {
    useEffect(() => {
      if (isUnauthenticated) {
        router.push(redirectTo);
      }
    }, [isUnauthenticated, router, redirectTo]);
  };

  // Redirect to dashboard if authenticated
  const redirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
    useEffect(() => {
      if (isAuthenticated) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, router, redirectTo]);
  };

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    isVerified,
    getAccessToken,
    getRefreshToken,
    requireAuth,
    redirectIfAuthenticated,
    user: session?.user || null,
  };
};
