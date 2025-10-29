'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const accessToken = searchParams.get('access_token');
      const error = searchParams.get('error');

      if (error) {
        router.push('/?error=' + encodeURIComponent(error));
        return;
      }

      if (accessToken) {
        localStorage.setItem('insforge-auth-token', accessToken);

        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync-token', token: accessToken }),
        });

        const destination = sessionStorage.getItem('auth_destination') || '/';
        sessionStorage.removeItem('auth_destination');

        setTimeout(() => router.push(destination), 100);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
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
