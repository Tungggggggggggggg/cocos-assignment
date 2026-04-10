"use client";
import { useCartStore } from '../store/cart';
import { useEffect, useState } from 'react';

export default function CartBadge() {
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <a
      id="cart-btn"
      href="/cart"
      aria-label="Giỏ hàng"
      className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative rounded-lg hover:bg-gray-100"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {mounted && totalItems > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-rose-500 rounded-full animate-bounce">
          {totalItems}
        </span>
      )}
    </a>
  );
}
