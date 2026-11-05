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
        let sessionRes = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'include',
        });

        // 2. If cookie was missing/expired, check if Supabase client in browser has an active session
        // and securely validate it server-side via Bearer header
        if (!sessionRes.ok) {
          const supabase = createClient();
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              sessionRes = await fetch('/api/auth/session', {
                cache: 'no-store',
                credentials: 'include',
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              });
            }
          }
        }

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.user) {
            setUser(sessionData.user);
            localStorage.setItem('elnix_admin_session', JSON.stringify(sessionData.user));
            setIsLoading(false);
            return;
          }
        }

        // If not authenticated or non-admin, clean up display cache
        localStorage.removeItem('elnix_admin_session');
        setUser(null);
      } catch (err) {
        console.warn('Auth check error:', err);
        localStorage.removeItem('elnix_admin_session');
        setUser(null);
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
        credentials: 'include',
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});

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
