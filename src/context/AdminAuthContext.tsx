'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AdminAuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  isAdmin: false,
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);

      // Clean up any deprecated localStorage bearer tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('elnix_admin_token');
      }

      try {
        // 1. Verify session with server-side auth endpoint using HttpOnly cookie
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.user) {
            setUser(sessionData.user);
            localStorage.setItem('elnix_admin_session', JSON.stringify(sessionData.user));
            setIsLoading(false);
            return;
          }
        }

        // 2. Check Supabase client session if available
        const supabase = createClient();
        if (supabase) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, full_name')
              .eq('id', authUser.id)
              .maybeSingle();

            const isVerifiedAdmin =
              profile?.role === 'admin' ||
              authUser.app_metadata?.role === 'admin';

            if (isVerifiedAdmin) {
              const adminUser: UserProfile = {
                id: authUser.id,
                email: authUser.email || '',
                full_name: profile?.full_name || 'Admin',
                role: 'admin',
              };
              setUser(adminUser);
              localStorage.setItem('elnix_admin_session', JSON.stringify(adminUser));
              setIsLoading(false);
              return;
            }
          }
        }

        // If not authenticated, clean up display cache
        localStorage.removeItem('elnix_admin_session');
        setUser(null);
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. Authenticate with server-side login endpoint (sets HttpOnly cookie)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('elnix_admin_session', JSON.stringify(data.user));

        // Connect Supabase client session in background if supported
        try {
          const supabase = createClient();
          if (supabase) {
            await supabase.auth.signInWithPassword({ email, password: pass });
          }
        } catch {
          // Direct client sign-in optional; server cookie is authoritative
        }

        toast.success('Admin Login Successful', {
          description: 'Logged into Elnix Powerzone CMS Dashboard.',
        });
        setIsLoading(false);
        return true;
      }

      if (res.status === 403) {
        toast.error('Access Denied', {
          description: 'Your account does not have Administrator privileges.',
        });
      } else {
        toast.error('Invalid Credentials', {
          description: data.error || 'Incorrect email or password.',
        });
      }

      setIsLoading(false);
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error('Login Error', { description: msg });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call server logout to clear HttpOnly cookie
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }

      localStorage.removeItem('elnix_admin_session');
      localStorage.removeItem('elnix_admin_token');
      setUser(null);

      toast.info('Logged Out', {
        description: 'You have been securely signed out of the admin panel.',
      });
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: !!(user && user.role === 'admin'),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
