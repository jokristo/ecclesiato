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

          return {
            id: data.user?.id ?? credentials.email,
            name: data.user?.name ?? credentials.email,
            email: data.user?.email ?? credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            role: data.user?.role ?? 'member',
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Premier login : on copie les données du user retourné par authorize()
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      // On expose les tokens et le rôle dans la session côté client
      (session as any).accessToken = token.accessToken;
      (session as any).role = token.role;
      if (session.user) {
        (session.user as any).role = token.role;
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
    maxAge: 7 * 24 * 60 * 60, // 7 jours (durée du refresh token k-voice)
  },

  secret: process.env.NEXTAUTH_SECRET,
};
