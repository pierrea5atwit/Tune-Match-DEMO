import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

async function fetchTracksWithTimeRange(accessToken: string, timeRange: string) {
  try {
    console.log(`Attempting to fetch tracks with time range: ${timeRange}`);
    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=30&time_range=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error(`Failed to parse response for ${timeRange}:`, responseText);
      return null;
    }

    if (!response.ok) {
      console.error(`Error fetching tracks for ${timeRange}:`, {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      return null;
    }

    console.log(`Successfully fetched ${responseData.items?.length || 0} tracks for ${timeRange}`);
    return responseData;
  } catch (error) {
    console.error(`Error in fetchTracksWithTimeRange for ${timeRange}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Log session state
    console.log('Session state:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      hasError: !!session?.error
    });
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    if (session.error) {
      return NextResponse.json({ error: `Session error: ${session.error}` }, { status: 401 });
    }
    
    if (!session.accessToken) {
      console.error('No access token found in session:', session);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Try different time ranges in order
    const timeRanges = ['short_term', 'medium_term', 'long_term'];
    let tracksData = null;
    let usedTimeRange = '';

    for (const timeRange of timeRanges) {
      console.log(`Trying time range: ${timeRange}`);
      tracksData = await fetchTracksWithTimeRange(session.accessToken, timeRange);
      if (tracksData && tracksData.items && tracksData.items.length > 0) {
        usedTimeRange = timeRange;
        break;
      }
    }

    if (!tracksData || !tracksData.items || tracksData.items.length === 0) {
      console.error('Failed to fetch tracks for all time ranges');
      return NextResponse.json(
        { error: 'No top tracks found for any time range' },
        { status: 404 }
      );
    }

    console.log(`Successfully fetched tracks using ${usedTimeRange} range`);
    
    // Get audio features for all tracks
    const trackIds = tracksData.items.map((track: any) => track.id).join(',');
    const featuresResponse = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!featuresResponse.ok) {
      const errorText = await featuresResponse.text();
      console.error('Failed to fetch audio features:', {
        status: featuresResponse.status,
        statusText: featuresResponse.statusText,
        error: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to fetch audio features' },
        { status: featuresResponse.status }
      );
    }

    const featuresData = await featuresResponse.json();

    // Combine track data with their audio features
    const tracksWithFeatures = tracksData.items.map((track: any, index: number) => ({
      ...track,
      audio_features: featuresData.audio_features[index],
    }));

    // Calculate mood and genre distributions
    const moodDistribution = analyzeMoods(tracksWithFeatures);
    const genreDistribution = await analyzeGenres(tracksWithFeatures, session.accessToken);

    return NextResponse.json({
      tracks: tracksWithFeatures.slice(0, 5), // Only send back top 5 for the track list
      analysis: {
        moods: moodDistribution,
        genres: genreDistribution,
      }
    });
  } catch (error) {
    console.error('Error in top-tracks route:', error);
    return NextResponse.json(
      { error: 'Internal server error processing tracks' },
      { status: 500 }
    );
  }
}

async function refreshAccessToken(token: any) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });
  
    const refreshedTokens = await response.json();
    if (!response.ok) throw new Error('Failed to refresh token');
  
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  }
  

function analyzeMoods(tracks: any[]) {
  const moods = {
    energetic: 0,
    chill: 0,
    happy: 0,
    melancholic: 0,
    danceable: 0,
  };

  tracks.forEach(track => {
    const features = track.audio_features;
    if (!features) return;

    // Energy contribution
    if (features.energy > 0.7) moods.energetic += 1;
    else if (features.energy < 0.4) moods.chill += 1;

    // Valence (happiness) contribution
    if (features.valence > 0.6) moods.happy += 1;
    else if (features.valence < 0.4) moods.melancholic += 1;

    // Danceability contribution
    if (features.danceability > 0.6) moods.danceable += 1;
  });

  // Convert to percentages
  const total = tracks.length;
  return Object.entries(moods).map(([mood, count]) => ({
    name: mood,
    percentage: Math.round((count / total) * 100)
  }));
}

async function analyzeGenres(tracks: any[], accessToken: string) {
  // Get unique artists
  const artistIds = [...new Set(tracks.flatMap(track => track.artists.map((artist: any) => artist.id)))];
  
  // Fetch artist details in batches of 50 (Spotify API limit)
  const genreCounts: { [key: string]: number } = {};
  
  for (let i = 0; i < artistIds.length; i += 50) {
    const batch = artistIds.slice(i, i + 50);
    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${batch.join(',')}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch artists:', await response.text());
      continue;
    }
    
    const data = await response.json();
    data.artists.forEach((artist: any) => {
      artist.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
  }

  // Convert to percentages and get top genres
  const total = Object.values(genreCounts).reduce((sum, count) => sum + count, 0);
  return Object.entries(genreCounts)
    .map(([genre, count]) => ({
      name: genre,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5); // Top 5 genres
} 