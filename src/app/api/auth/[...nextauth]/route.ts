import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000, // -60 seconds to avoid edge cases
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope: scopes }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + (account.expires_in as number * 1000);
        return token;
      }

      // Return previous token if it's still valid
      if (typeof token.expiresAt === 'number' && Date.now() < token.expiresAt) {
        return token;
      }

      // Token has expired, try to refresh it
      console.log("Token expired, attempting refresh...");
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error) {
        console.error("Token error detected:", token.error);
      }
      
      session.accessToken = token.accessToken as string;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      
      // Log session state for debugging
      console.log("Session updated:", {
        hasAccessToken: !!session.accessToken,
        hasError: !!session.error
      });
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('Auth error:', code, metadata);
    },
    warn(code) {
      console.warn('Auth warning:', code);
    },
    debug(code, metadata) {
      console.log('Auth debug:', code, metadata);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 