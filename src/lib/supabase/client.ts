import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    supabaseKey &&
    !supabaseKey.includes('placeholder');

  if (!isConfigured) {
    return null;
  }

  if (!client) {
    client = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });

    // Cleanup bloated chunked cookies from document.cookie that cause HTTP 431 on localhost
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.cookie) {
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
            document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            document.cookie = `${name}=; Path=/; Domain=localhost; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          }
        }
      } catch {
        // ignore
      }
    }
  }

  return client;
}
