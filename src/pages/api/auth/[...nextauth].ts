import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api, TokenManager } from '../../../lib/api';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
      },
      async authorize(credentials) {
        try {
          // If accessToken is provided (from OTP verification), use it directly
          if (credentials?.accessToken) {
            try {
              const profile = await api.getProfile(credentials.accessToken);
              return {
                id: profile.user.id,
                email: profile.user.email,
                name: profile.user.username,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken || '',
                isVerified: profile.user.is_verified,
              };
            } catch (error) {
              console.error('Token validation failed:', error);
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
          TokenManager.setTokens(authResponse.access_token, authResponse.refresh_token);

          return {
            id: authResponse.user.id,
            email: authResponse.user.email,
            name: authResponse.user.username,
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            isVerified: authResponse.user.is_verified,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          isVerified: user.isVerified,
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
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.isVerified = token.isVerified as boolean;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function refreshAccessToken(token: any) {
  try {
    const refreshedTokens = await api.refreshToken(token.refreshToken);
    
    if (!refreshedTokens) {
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export default NextAuth(authOptions);
