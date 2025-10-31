"use client";

import { InsforgeCallback } from "@insforge/nextjs";

export default function CallbackPage() {
  return (
    <InsforgeCallback
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-black">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Completing authentication...
            </h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </div>
      }
    />
  );
}
