import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'K-Voice',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data } = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (!data.access_token) return null;

          const u = data.user;
          return {
            id: u?.id ?? credentials.email,
            name: u?.name ?? credentials.email,
            email: u?.email ?? credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            role: u?.role ?? 'member',
            organizationId: u?.organization_id ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.userId = (user as any).id;
        token.organizationId = (user as any).organizationId;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).role = token.role;
      (session as any).userId = token.userId;
      (session as any).organizationId = token.organizationId;
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.userId;
        (session.user as any).organizationId = token.organizationId;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
