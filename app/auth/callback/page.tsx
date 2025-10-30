'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@insforge/sdk';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Get parameters from URL query string
      // Both OAuth and email/password flows now return: access_token, user_id, email, name (optional)
      const accessToken = searchParams.get('access_token');
      const userId = searchParams.get('user_id');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const error = searchParams.get('error');

      if (error) {
        router.push('/?error=' + encodeURIComponent(error));
        return;
      }

      if (accessToken) {
        // Store token in localStorage
        localStorage.setItem('insforge-auth-token', accessToken);

        // If we have user info from URL (complete OAuth/email flow), store it directly
        // The Insforge SDK will automatically detect these parameters and populate user profile
        if (userId && email) {
          const userProfile = {
            user: {
              id: userId,
              email: email,
              name: name || '',
              emailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            profile: {},
          };
          localStorage.setItem('insforge-user-profile', JSON.stringify(userProfile));
        } else {
          // Fallback: Fetch user info if URL params are missing (shouldn't happen with updated backend)
          try {
            const insforge = createClient({
              url: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'http://localhost:7130',
            });
            const { data } = await insforge.auth.getCurrentUser();
            if (data) {
              localStorage.setItem('insforge-user-profile', JSON.stringify(data));
            }
          } catch (err) {
            console.warn('Failed to fetch user info:', err);
          }
        }

        // Sync token to HTTP-only cookie via API route (for server-side middleware)
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync-token', token: accessToken }),
        });

        // Clean up URL to remove sensitive data from browser history
        window.history.replaceState({}, '', '/auth/callback');

        // Get destination and redirect
        const destination = sessionStorage.getItem('auth_destination') || '/';
        sessionStorage.removeItem('auth_destination');

        setTimeout(() => router.push(destination), 100);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-black">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Completing authentication...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
