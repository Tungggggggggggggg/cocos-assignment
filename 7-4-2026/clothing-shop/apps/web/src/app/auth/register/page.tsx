"use client";
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.includes('@') || !email.includes('.')) {
      setError("Email không đúng định dạng. Vui lòng kiểm tra lại.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer'
        }
      }
    });

    if (error) {
      
      let friendlyMessage = error.message;
      if (error.status === 429) {
        friendlyMessage = "Hệ thống đang bận vì bạn thao tác quá nhanh. Vui lòng đợi 1-2 phút rồi thử lại.";
      } else if (error.status === 422 || error.message.includes("already registered")) {
        friendlyMessage = "Email này đã được đăng ký. Hãy thử đăng nhập hoặc dùng email khác.";
      } else if (error.message.includes("at least 6 characters")) {
        friendlyMessage = "Mật khẩu quá ngắn (tối thiểu phải 6 ký tự).";
      } else if (friendlyMessage.includes("signups are disabled")) {
        friendlyMessage = "Lỗi: Tính năng Đăng ký đang bị TẮT trên Supabase Dashboard. Vui lòng vào Authentication > Providers > Email để Bật (Enable) nó lên!";
      }
      
      setError(friendlyMessage);
      setLoading(false);
      return;
    }

    router.push('/auth/login?message=Chúng tôi đã gửi link xác thực vào email của bạn. Hãy kiểm tra hộp thư!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Đăng Ký</h2>
          <p className="mt-4 text-gray-500">Tham gia cộng đồng thời trang S.M.A.R.T</p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 italic">
              * {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Họ và tên của bạn"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ NGAY'}
          </button>

          <p className="text-center text-gray-500">
            Đã có tài khoản?{' '}
            <a href="/auth/login" className="text-gray-900 font-bold hover:underline">Đăng nhập ngay</a>
          </p>
        </form>
      </div>
    </div>
  );
}
