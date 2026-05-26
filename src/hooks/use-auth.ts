'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export type AppRole = 'super_admin' | 'admin' | 'editor' | 'member';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user ?? null;
  const accessToken = (session as any)?.accessToken as string | undefined;
  const role = (session as any)?.role as AppRole | undefined;
  const userId = (session as any)?.userId as string | undefined;
  const organizationId = (session as any)?.organizationId as string | undefined;

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

  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'admin';
  const isAdmin = isSuperAdmin || isOrgAdmin;
  const isEditor = role === 'editor' || isAdmin;

  return {
    user,
    accessToken,
    role,
    userId,
    organizationId,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    isOrgAdmin,
    isAdmin,
    isEditor,
    login,
    logout,
  };
}
