import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      console.error('No access token found in session:', session);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch artists:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch top artists' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 