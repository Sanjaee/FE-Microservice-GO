import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { apiClient as api, TokenManager } from "../../../lib/api-client";
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          // If accessToken is provided (from OTP verification), use it directly
          if (credentials?.accessToken) {
            try {
              api.setAccessToken(credentials.accessToken);
              const profile = await api.getProfile();
              return {
                id: profile.user.id,
                email: profile.user.email,
                name: profile.user.username,
                image: profile.user.image_url || "",
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken || "",
                isVerified: profile.user.is_verified,
                type: profile.user.type,
              };
            } catch (error) {
              console.error("Token validation failed:", error);
              return null;
            }
          }

          // Regular login with email/password
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const authResponse = await api.login({
            email: credentials.email,
            password: credentials.password,
          });

          // Store tokens in localStorage
          TokenManager.setTokens(
            authResponse.access_token,
            authResponse.refresh_token
          );

          return {
            id: authResponse.user.id,
            email: authResponse.user.email,
            name: authResponse.user.username,
            image: authResponse.user.image_url || "",
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            isVerified: authResponse.user.is_verified,
            type: authResponse.user.type,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth
      if (account?.provider === "google") {
        try {
          const authResponse = await api.googleOAuth({
            email: user.email!,
            username: user.name || user.email!.split("@")[0],
            image_url: user.image || "",
            google_id: account.providerAccountId,
          });

          // Store the tokens in the user object for the JWT callback
          user.accessToken = authResponse.access_token;
          user.refreshToken = authResponse.refresh_token;
          user.isVerified = authResponse.user.is_verified;
          user.type = authResponse.user.type;
          user.image = authResponse.user.image_url || user.image;

          return true;
        } catch (error) {
          console.error("Google OAuth error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          isVerified: user.isVerified,
          type: user.type,
          image: user.image,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.image = token.image as string;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.isVerified = token.isVerified as boolean;
      session.type = token.type as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

async function refreshAccessToken(token: any) {
  try {
    const refreshedTokens = await api.refreshToken(token.refreshToken);

    if (!refreshedTokens) {
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth(authOptions);
