import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: "RefreshAccessTokenError" | undefined;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface JWT {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
} 