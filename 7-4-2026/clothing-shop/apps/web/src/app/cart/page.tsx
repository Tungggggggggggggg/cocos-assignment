"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function CartPage() {
  const { items, removeItem, getTotal, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let user = session?.user;
      
      
      if (!user) {
        const localToken = localStorage.getItem('local_access_token');
        if (localToken) {
          try {
            const payload = JSON.parse(atob(localToken.split('.')[1]));
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {}
            } as User;
          } catch (e) {
            console.error("Failed to decode local token", e);
          }
        }
      }

      if (!user) {
        alert("Vui lòng đăng nhập để thanh toán");
        router.push("/auth/login");
        return;
      }

      
      let lastCartId = null;
      for (const item of items) {
        const res = await apiFetch('/api/carts/items', {
          method: 'POST',
          body: JSON.stringify({ variantId: item.id, quantity: item.quantity })
        });
        lastCartId = res.cartId;
      }

      if (!lastCartId) throw new Error("Không thể khởi tạo giỏ hàng");

      
      const orderRes = await apiFetch('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          cartId: lastCartId,
          shippingAddress: {
            fullName: user.user_metadata?.full_name || user.email || "Khách hàng",
            phone: "0901234567",
            addressLine: "123 Đường ABC, Quận 1",
            district: "Quận 1",
            city: "TP. Hồ Chí Minh"
          }
        })
      });

      alert(`Đặt hàng thành công! Mã đơn: ${orderRes.orderNo}`);
      clearCart();
      router.push("/");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Lỗi khi đặt hàng");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Giỏ hàng trống</h2>
        <p className="mt-4 text-gray-500">Hãy tiếp tục khám phá các sản phẩm mới nhất của chúng tôi.</p>
        <button onClick={() => router.push("/")} className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-full font-bold">Quay lại cửa hàng</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-gray-900 mb-10">Giỏ Hàng Của Bạn</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {items.map((item) => (
              <li key={item.id} className="flex py-6 sm:py-10">
                <div className="flex-shrink-0 relative h-24 w-24 rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.size} | {item.color}</p>
                      <p className="mt-1 text-sm font-black text-rose-600">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      <p className="text-sm text-gray-500 font-medium">Số lượng: {item.quantity}</p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="mt-2 text-rose-500 text-xs font-bold hover:underline"
                      >
                        Xóa khỏi giỏ
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm lg:col-span-5 lg:mt-0">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Tạm tính</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(getTotal())}</p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-lg font-black text-gray-900">Tổng cộng</p>
              <p className="text-lg font-black text-rose-600">{formatCurrency(getTotal())}</p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {isCheckingOut ? "Đang xử lý..." : "Thanh Toán Ngay"}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
             Thanh toán an toàn qua cổng VNPay/MoMo
          </div>
        </div>
      </div>
    </div>
  );
}
