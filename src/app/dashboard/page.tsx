'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-xl text-gray-300 animate-pulse">Loading your music profile...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-gray-800 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              TuneMatch
            </h1>
            <button
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Profile</h2>
            <div className="flex items-center space-x-4">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="text-lg font-medium text-gray-100">{session?.user?.name}</p>
                <p className="text-sm text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Top Artists Card */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Top Artists</h2>
            <p className="text-gray-400">Coming soon! We'll show your most-played artists here.</p>
          </div>

          {/* Top Tracks Card */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Top Tracks</h2>
            <p className="text-gray-400">Coming soon! We'll show your favorite tracks here.</p>
          </div>

          {/* Recommendations Card */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Recommendations</h2>
            <p className="text-gray-400">
              Based on your listening history, we'll provide personalized music recommendations here.
              Stay tuned!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 