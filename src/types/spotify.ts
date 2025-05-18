export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
}

export interface TopArtistsResponse {
  items: SpotifyArtist[];
}

export interface TopTracksResponse {
  items: SpotifyTrack[];
} 