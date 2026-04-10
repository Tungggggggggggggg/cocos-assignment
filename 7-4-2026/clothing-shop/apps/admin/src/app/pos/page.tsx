'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ChevronRight,
  Package,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { apiFetch } from '@/lib/api';

function cn(...inputs: (string | number | boolean | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

type Product = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  category_name: string;
  min_price: string;
};

type Category = {
  id: string;
  name: string;
};

type Variant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  retail_price: string;
  available_qty: number;
};

type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
};

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeProduct, setActiveProduct] = useState<(Product & { variants: Variant[] }) | null>(null);
  const [isCashedOut, setIsCashedOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'demo'>('demo');
  const [isProcessing, setIsProcessing] = useState(false);

  
  const { data: categories } = useSWR<Category[]>('/api/categories', apiFetch);
  
  
  
  const { data: productsData, isLoading } = useSWR<{ items: Product[], meta: { total: number } }>(
    `/api/products?${selectedCategory ? `categoryId=${selectedCategory}` : ''}${search ? `&q=${search}` : ''}`, 
    apiFetch
  );

  const products = productsData?.items || [];

  const addToCart = (variant: Variant, product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        return prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: Number(variant.retail_price),
        quantity: 1
      }];
    });
    setActiveProduct(null);
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await apiFetch('/api/orders/pos-checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
          paymentMethod: paymentMethod,
          customerNotes: 'Bán tại quầy'
        })
      });

      setIsCashedOut(true);
      setCart([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi xử lý đơn hàng.';
      alert(`Lỗi: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProductClick = async (product: Product) => {
    
    try {
      const data = await apiFetch(`/api/products/${product.slug}`);
      setActiveProduct(data);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  if (isCashedOut) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Thanh toán hoàn tất!</h2>
          <p className="text-gray-500 mt-2">Đơn hàng đã được lưu và kho đã được cập nhật.</p>
        </div>
        <button 
          onClick={() => setIsCashedOut(false)}
          className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition shadow-md"
        >
          Tiếp tục bán hàng
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 -m-2">
      {}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {}
        <div className="p-4 border-b border-gray-50 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm hoặc SKU..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition",
                !selectedCategory ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Tất cả
            </button>
            {categories?.map((cat: Category) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition",
                  selectedCategory === cat.id ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
              {products?.map((prod: Product) => (
                <div 
                  key={prod.id} 
                  onClick={() => handleProductClick(prod)}
                  className="group relative flex flex-col bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-white transition-all cursor-pointer p-3"
                >
                  <div className="aspect-square rounded-xl bg-gray-200 mb-3 overflow-hidden">
                    {prod.image_url ? (
                      <Image 
                        src={prod.image_url} 
                        alt={prod.name} 
                        width={200} 
                        height={200} 
                        className="w-full h-full object-cover group-hover:scale-105 transition" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={32} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{prod.name}</h3>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    {Number(prod.min_price).toLocaleString()}đ
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg">
                      <Plus size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-gray-900" />
            <h2 className="font-bold text-gray-900">Chi tiết đơn</h2>
          </div>
          <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600">
            {cart.length} món
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
              <ShoppingCart size={48} />
              <p className="text-sm">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase mt-0.5">{item.sku} • {item.size} • {item.color}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-indigo-600">{item.price.toLocaleString()}đ</span>
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                      <button 
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                   onClick={() => removeFromCart(item.variantId)}
                   className="text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tạm tính</span>
              <span className="font-medium">{totalAmount.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giảm giá</span>
              <span className="text-emerald-600">0đ</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
              <span className="font-bold text-gray-900">Tổng cộng</span>
              <span className="text-xl font-black text-indigo-600">{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setPaymentMethod('demo')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition",
                paymentMethod === 'demo' ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <CreditCard size={18} />
              <span className="text-[10px] font-bold">Thẻ (Demo)</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition",
                paymentMethod === 'cash' ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <Banknote size={18} />
              <span className="text-[10px] font-bold">Tiền mặt</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Đang xử lý...' : (
              <>
                Hoàn tất thanh toán
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{activeProduct.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Vui lòng chọn biến thể</p>
              </div>
              <button onClick={() => setActiveProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {activeProduct.variants.map(v => (
                <button
                  key={v.id}
                  disabled={v.available_qty <= 0}
                  onClick={() => addToCart(v, activeProduct)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition group disabled:opacity-50 disabled:grayscale"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{v.size} / {v.color}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{v.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{Number(v.retail_price).toLocaleString()}đ</p>
                    <p className={cn("text-[10px] font-bold", v.available_qty > 0 ? "text-emerald-500" : "text-red-500")}>
                      {v.available_qty > 0 ? `Còn ${v.available_qty} món` : 'Hết hàng'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-6 bg-gray-50 text-center">
              <p className="text-[10px] text-gray-400">Nhấn vào biến thể để thêm vào giỏ hàng</p>
            </div>
          </div>
        </div>
      )}

      {}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e5e5; }
      `}</style>
    </div>
  );
}
