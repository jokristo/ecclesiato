'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user ?? null;
  const accessToken = (session as any)?.accessToken as string | undefined;
  const role = (session as any)?.role as 'admin' | 'editor' | 'member' | undefined;

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Identifiants incorrects');
    }

    return result;
  };

  const logout = async (redirectTo = '/login') => {
    await signOut({ redirect: false });
    router.push(redirectTo);
  };

  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || role === 'admin';

  return {
    user,
    accessToken,
    role,
    isLoading,
    isAuthenticated,
    isAdmin,
    isEditor,
    login,
    logout,
  };
}
