'use client';

import { signIn } from 'next-auth/react';

export default function SpotifyLoginButton() {
  const handleLogin = async () => {
    try {
      await signIn('spotify', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105"
      onClick={handleLogin}
    >
      Connect with Spotify
    </button>
  );
} 