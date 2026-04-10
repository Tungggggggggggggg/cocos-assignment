"use client";
import React, { useState, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.includes('@')) {
      setError("Vui lòng nhập email hợp lệ.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    const { error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError) {
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
          const resData = await res.json();
          
          const token = resData.data?.access_token || resData.access_token;
          if (token) {
            localStorage.setItem('local_access_token', token);
            router.push('/');
            return;
          }
        }
      } catch (localError) {
        console.error("Local login failed:", localError);
      }

      let friendlyMessage = supabaseError.message;
      if (supabaseError.message.includes("Invalid login credentials")) {
        friendlyMessage = "Email hoặc mật khẩu không chính xác.";
      } else if (supabaseError.message.includes("Email not confirmed")) {
        friendlyMessage = "Bạn chưa xác thực email. Vui lòng kiểm tra hộp thư đến.";
      }
      setError(friendlyMessage);
      setLoading(false);
      return;
    }

    router.push('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Đăng Nhập</h2>
          <p className="mt-4 text-gray-500">Chào mừng bạn trở lại với S.M.A.R.T</p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          {message && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm border border-emerald-100 font-bold mb-4">
              ✓ {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 italic">
              * {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Email của bạn"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Mật khẩu"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember" type="checkbox" className="h-4 w-4 text-gray-900 border-gray-300 rounded" />
              <label htmlFor="remember" className="ml-2 text-gray-500">Ghi nhớ đăng nhập</label>
            </div>
            <a href="#" className="font-medium text-gray-900 hover:underline">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'TIẾP TỤC'}
          </button>

          <p className="text-center text-gray-500">
            Chưa có tài khoản?{' '}
            <a href="/auth/register" className="text-gray-900 font-bold hover:underline">Đăng ký ngay</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
