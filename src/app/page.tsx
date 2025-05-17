import SpotifyLoginButton from '../components/SpotifyLoginButton';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          TuneMatch
        </h1>
        <p className="text-xl mb-8 text-gray-300">
          Discover music that matches your taste. Get personalized recommendations based on your listening history and preferences.
        </p>
        <SpotifyLoginButton />
      </div>
    </div>
  )
} 