"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      
      
      if (pathname === '/login') {
        setLoading(false);
        return;
      }

      
      const localToken = localStorage.getItem('local_access_token');
      let localUser: { user_metadata?: { role: string }, role?: string } | null = null;
      
      if (localToken) {
        try {
          const payload = JSON.parse(atob(localToken.split('.')[1]));
          
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp > now) {
            localUser = payload;
          } else {
            localStorage.removeItem('local_access_token');
          }
        } catch (e) {
          console.error("Lỗi giải mã local token:", e);
        }
      }

      
      const hasSupabaseAdmin = supabaseSession && (supabaseSession.user?.user_metadata?.role === 'admin');
      const hasLocalAdmin = localUser && (localUser.user_metadata?.role === 'admin' || localUser.role === 'admin');

      if (!hasSupabaseAdmin && !hasLocalAdmin) {
        console.log("[AdminAuthGuard] Không tìm thấy quyền Admin hợp lệ, chuyển hướng...");
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (loading && pathname !== '/login') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white font-bold animate-pulse">
        S.M.A.R.T SECURING...
      </div>
    );
  }

  return <>{children}</>;
}
