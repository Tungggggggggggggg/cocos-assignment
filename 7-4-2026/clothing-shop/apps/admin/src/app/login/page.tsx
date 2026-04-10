"use client";
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (supabaseError) {
      console.log("[Admin Login] Supabase error, switching to Local Auth Bridge...");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
        });
        
        console.log(`[Admin Login] Local response status: ${res.status}`);
        
        if (res.ok) {
          const resData = await res.json();
          const actualData = resData.data || resData;
          if (actualData.user?.role === 'admin') {
            console.log("[Admin Login] Local Admin success!");
            localStorage.setItem('local_access_token', actualData.access_token);
            router.push('/');
            return;
          } else {
            setError('Tài khoản này không có quyền truy cập Admin (Xác thực cục bộ).');
            setLoading(false);
            return;
          }
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Lỗi xác thực cục bộ' }));
          console.error("[Admin Login] Local bridge failed:", errorData);
          setError(errorData.message || 'Email hoặc mật khẩu không đúng.');
          setLoading(false);
          return;
        }
      } catch (localError) {
        console.error("[Admin Login] Critical fallback error:", localError);
        setError('Không thể kết nối đến máy chủ xác thực cục bộ.');
        setLoading(false);
        return;
      }
    }

    
    const userRole = supabaseData.user?.user_metadata?.role;
    if (userRole !== 'admin') {
      await supabase.auth.signOut();
      setError('Tài khoản này không có quyền truy cập Admin Dashboard.');
      setLoading(false);
      return;
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight">S.M.A.R.T Admin</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Đăng nhập để quản lý hệ thống</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-lg text-sm font-bold border border-rose-100 animate-shake">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="admin@smart.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
