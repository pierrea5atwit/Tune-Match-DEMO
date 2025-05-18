'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { TopArtistsResponse, TopTracksResponse } from '@/types/spotify';
import MusicAnalysis from '@/components/MusicAnalysis';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topArtists, setTopArtists] = useState<TopArtistsResponse | null>(null);
  const [topTracks, setTopTracks] = useState<TopTracksResponse | null>(null);
  const [analysis, setAnalysis] = useState<{ moods: any[]; genres: any[]; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        // Check for session errors
        if (session?.error === "RefreshAccessTokenError") {
          await signOut({ callbackUrl: '/' });
          return;
        }

        const [artistsRes, tracksRes] = await Promise.all([
          fetch('/api/spotify/top-artists', { credentials: 'include' }),
  fetch('/api/spotify/top-tracks', { credentials: 'include' })
        ]);

        if (!artistsRes.ok || !tracksRes.ok) {
          if (artistsRes.status === 401 || tracksRes.status === 401) {
            // Token expired, sign out user
            await signOut({ callbackUrl: '/' });
            return;
          }
          throw new Error('Failed to fetch Spotify data');
        }

        const [artistsData, tracksData] = await Promise.all([
          artistsRes.json(),
          tracksRes.json()
        ]);

        if (artistsData.error || tracksData.error) {
          throw new Error(artistsData.error || tracksData.error);
        }

        setTopArtists(artistsData);
        setTopTracks({ items: tracksData.tracks });
        setAnalysis(tracksData.analysis);
      } catch (err) {
        console.error('Error fetching Spotify data:', err);
        setError('Failed to load your music data. Please try signing in again.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.accessToken) {
      fetchSpotifyData();
    }
  }, [status, session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="text-red-400 bg-red-900/20 p-4 rounded-lg mb-8">
            {error}
          </div>
        ) : (
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
              {topArtists?.items ? (
                <ul className="space-y-4">
                  {topArtists.items.map((artist) => (
                    <li key={artist.id} className="flex items-center space-x-3">
                      {artist.images[0] && (
                        <img
                          src={artist.images[0].url}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <a
                          href={artist.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-100 hover:text-green-400 transition-colors"
                        >
                          {artist.name}
                        </a>
                        <p className="text-sm text-gray-400">
                          {artist.genres.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Loading your top artists...</p>
              )}
            </div>

            {/* Top Tracks Card */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Top Tracks</h2>
              {topTracks?.items ? (
                <ul className="space-y-4">
                  {topTracks.items.map((track) => (
                    <li key={track.id} className="flex items-center space-x-3">
                      {track.album.images[0] && (
                        <img
                          src={track.album.images[0].url}
                          alt={track.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <a
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-100 hover:text-green-400 transition-colors"
                        >
                          {track.name}
                        </a>
                        <p className="text-sm text-gray-400">
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Loading your top tracks...</p>
              )}
            </div>

            {/* Music Analysis */}
            {analysis && (
              <MusicAnalysis
                moods={analysis.moods}
                genres={analysis.genres}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
} 