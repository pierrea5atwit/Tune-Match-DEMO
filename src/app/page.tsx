import SpotifyLoginButton from '../components/SpotifyLoginButton';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient with animated effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black animate-gradient-slow"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-text">
            TuneMatch
          </h1>
          <p className="text-2xl mb-12 text-gray-200 leading-relaxed">
            Discover music that resonates with your soul. Get personalized recommendations powered by your unique taste and listening history.
          </p>
          <div className="space-y-8">
            <SpotifyLoginButton />
            <p className="text-sm text-gray-400">
              Powered by Spotify's extensive music library
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 