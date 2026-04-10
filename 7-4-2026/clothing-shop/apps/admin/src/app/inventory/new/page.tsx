"use client";

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

type Product = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  category_name: string;
  min_price: string;
};

type Variant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  retail_price: string;
  available_qty: number;
};

type ImportItem = {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitCost: number;
};

export default function NewInventoryImportPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [importList, setImportList] = useState<ImportItem[]>([]);
  const [activeProduct, setActiveProduct] = useState<(Product & { variants: Variant[] }) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: productsData, isLoading } = useSWR<{ items: Product[] }>(
    `/api/products?${search ? `q=${search}` : ''}`, 
    apiFetch
  );

  const products = productsData?.items || [];

  const handleProductClick = async (product: Product) => {
    try {
      const data = await apiFetch(`/api/products/${product.slug}`);
      setActiveProduct(data);
    } catch (err) {
      console.error("Failed to fetch product variants:", err);
    }
  };

  const addToImportList = (variant: Variant, product: Product) => {
    setImportList(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) return prev;
      
      return [...prev, {
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: 1,
        unitCost: Math.floor(Number(variant.retail_price) * 0.6) // Default 60% of retail
      }];
    });
    setActiveProduct(null);
  };

  const updateItem = (variantId: string, updates: Partial<ImportItem>) => {
    setImportList(prev => prev.map(item => 
      item.variantId === variantId ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (variantId: string) => {
    setImportList(prev => prev.filter(item => item.variantId !== variantId));
  };

  const totalCost = importList.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleSubmit = async () => {
    if (importList.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch('/api/inventory/imports', {
        method: 'POST',
        body: JSON.stringify({
          items: importList.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitCost: item.unitCost
          }))
        })
      });

      mutate('/api/inventory/logs');
      router.push('/inventory');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi nhập kho.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Tạo Phiếu Nhập Hàng</h1>
        </div>
        <button
          disabled={importList.length === 0 || isSubmitting}
          onClick={handleSubmit}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg"
        >
          {isSubmitting ? 'Đang xử lý...' : (
            <>
              <CheckCircle2 size={20} />
              Xác Nhận Nhập Kho
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left column: Search */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0">
          <div className="p-4 border-b border-gray-50 bg-gray-50/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm sản phẩm để nhập kho..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[3/4] bg-gray-50 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((prod) => (
                  <div 
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="group bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-white transition cursor-pointer p-3"
                  >
                    <div className="aspect-square rounded-xl bg-gray-200 mb-2 overflow-hidden relative">
                      {prod.image_url ? (
                        <Image 
                          src={prod.image_url} 
                          alt={prod.name} 
                          fill
                          className="object-cover group-hover:scale-110 transition duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                      )}
                      <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/10 transition" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{prod.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">{prod.category_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Form */}
        <div className="w-[450px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Danh Sách Nhập Kho</h2>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              {importList.length} mặt hàng
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {importList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus size={32} />
                </div>
                <p className="text-sm font-medium">Chọn sản phẩm bên trái để bắt đầu</p>
              </div>
            ) : (
              importList.map((item) => (
                <div key={item.variantId} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5">{item.sku} • {item.size} / {item.color}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.variantId)}
                      className="text-gray-300 hover:text-rose-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Số lượng</label>
                      <div className="flex items-center bg-white rounded-xl border border-gray-200">
                        <button 
                          onClick={() => updateItem(item.variantId, { quantity: Math.max(1, item.quantity - 1) })}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.variantId, { quantity: parseInt(e.target.value) || 0 })}
                          className="w-full text-center text-sm font-bold border-none outline-none focus:ring-0 p-0 h-10"
                        />
                        <button 
                          onClick={() => updateItem(item.variantId, { quantity: item.quantity + 1 })}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Giá vốn (VNĐ)</label>
                      <div className="bg-white rounded-xl border border-gray-200 px-3 flex items-center">
                        <input 
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateItem(item.variantId, { unitCost: parseInt(e.target.value) || 0 })}
                          className="w-full text-sm font-bold border-none outline-none focus:ring-0 p-0 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Tổng cộng phí nhập</p>
                <p className="text-2xl font-black text-gray-900">{totalCost.toLocaleString()}đ</p>
              </div>
              <p className="text-[10px] text-gray-400 text-right">Giá gốc đại diện sẽ được<br/>cập nhật theo cơ chế Bình quân gia quyền</p>
            </div>
          </div>
        </div>
      </div>

      {/* Variant Selector Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">{activeProduct.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Vui lòng chọn biến thể để nhập hàng</p>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {activeProduct.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => addToImportList(v, activeProduct)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition group"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{v.size} / {v.color}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{v.sku}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition" />
                </button>
              ))}
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setActiveProduct(null)}
                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e5e5; }
      `}</style>
    </div>
  );
}
