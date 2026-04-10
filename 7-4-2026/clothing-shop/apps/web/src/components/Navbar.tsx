"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CartBadge from './CartBadge';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        
        const localToken = localStorage.getItem('local_access_token');
        if (localToken) {
          try {
            const payload = JSON.parse(atob(localToken.split('.')[1]));
            setUser({
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {}
            } as User);
          } catch (e) {
            console.error("Failed to decode local token", e);
          }
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (!localStorage.getItem('local_access_token')) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('local_access_token');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900">
              S.M.A.R.T
            </Link>
          </div>

          {}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              href="/"
              className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-bold"
            >
              New Arrivals
            </Link>
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
            >
              Sản phẩm
            </Link>
          </div>

          {}
          <div className="flex items-center space-x-2">
            {user && <CartBadge />}
            
            <div className="pl-4 border-l border-gray-100 flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                   <span className="text-xs font-bold text-gray-500 hidden md:inline">Chào, {user.user_metadata?.full_name || user.email}</span>
                   <button 
                     onClick={handleLogout}
                     className="text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors"
                   >
                     Đăng xuất
                   </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Đăng nhập</Link>
                  <Link href="/auth/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg">Bắt đầu</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
