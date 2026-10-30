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
      try {
        // First check session storage for demo admin or restored session
        const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('elnix_admin_session') : null;
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            if (parsed && parsed.role === 'admin') {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem('elnix_admin_session');
          }
        }

        // Check Supabase if configured
        const supabase = createClient();
        if (supabase) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            // Check profiles table for role
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

            if (profile && profile.role === 'admin') {
              const adminUser: UserProfile = {
                id: authUser.id,
                email: authUser.email || '',
                full_name: profile.full_name || 'Admin',
                role: 'admin',
              };
              setUser(adminUser);
              setIsLoading(false);
              return;
            }
          }
        }
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
      const supabase = createClient();

      // If Supabase is connected, attempt Supabase Auth
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (!error && data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile && profile.role === 'admin') {
            const adminUser: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: profile.full_name || 'Elnix Administrator',
              role: 'admin',
            };
            setUser(adminUser);
            localStorage.setItem('elnix_admin_session', JSON.stringify(adminUser));
            toast.success('Welcome back, Admin!', {
              description: 'Successfully authenticated via Supabase.',
            });
            setIsLoading(false);
            return true;
          } else {
            toast.error('Access Denied', {
              description: 'Your account does not have Administrator privileges.',
            });
            await supabase.auth.signOut();
            setIsLoading(false);
            return false;
          }
        }
      }

      // Default Admin / Demo credentials fallback
      const normalizedEmail = email.trim().toLowerCase();
      if (
        (normalizedEmail === 'admin@elnixpowerzone.in' && pass === 'Elnix-user@2026') ||
        (normalizedEmail === 'admin@elnixpowerzone.com' && pass === 'admin123') ||
        (normalizedEmail === 'admin@elnix.com' && pass === 'admin123') ||
        (pass === 'elnix2026')
      ) {
        const demoAdmin: UserProfile = {
          id: 'admin-master',
          email: normalizedEmail,
          full_name: 'Elnix Administrator',
          role: 'admin',
        };
        setUser(demoAdmin);
        localStorage.setItem('elnix_admin_session', JSON.stringify(demoAdmin));
        toast.success('Admin Login Successful', {
          description: 'Logged into Elnix Powerzone CMS Dashboard.',
        });
        setIsLoading(false);
        return true;
      }

      toast.error('Invalid Credentials', {
        description: 'Incorrect email or password. Use demo credentials or configured Supabase user.',
      });
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
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('elnix_admin_session');
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

