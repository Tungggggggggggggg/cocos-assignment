"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Product, ProductVariant } from "@/types/schema";

export default function ProductDetails() {
  const { slug } = useParams();
  const { data: product, error, isLoading } = useSWR<Product>(`/api/products/${slug}`, apiFetch);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  if (isLoading) return <div className="p-24 text-center">Đang tải thông tin sản phẩm...</div>;
  if (error || !product) return <div className="p-24 text-center text-rose-500 font-bold">Không tìm thấy sản phẩm này</div>;

  const selectedVariant = product.variants?.find((v: ProductVariant) => v.id === selectedVariantId) || product.variants?.[0];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      id: selectedVariant.id,
      name: product.name,
      price: selectedVariant.retail_price,
      quantity: quantity,
      image: product.image_url || "",
      size: selectedVariant.size,
      color: selectedVariant.color,
    });
    alert("Đã thêm vào giỏ hàng! Sản phẩm sẽ được giữ chỗ trong 15 phút.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        {}
        <div className="flex flex-col">
          <div className="w-full aspect-square relative rounded-3xl overflow-hidden bg-gray-100 shadow-xl group">
             <Image
                src={product.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop"}
                alt={product.name}
                fill
                priority
                className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-700"
             />
          </div>
        </div>

        {}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{product.name}</h1>
          
          <div className="mt-4">
            <h2 className="sr-only">Thông tin sản phẩm</h2>
            <p className="text-3xl font-bold text-rose-600">
              {formatCurrency(selectedVariant?.retail_price || 0)}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Mô tả</h3>
            <div className="mt-4 text-gray-600 leading-relaxed font-light">
               <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
            </div>
          </div>

          <div className="mt-10">
             {}
             <div className="flex flex-col gap-6">
                <div>
                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Kích thước & Màu sắc</h3>
                   <div className="flex flex-wrap gap-3">
                      {product.variants?.map((v: ProductVariant) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                            selectedVariantId === v.id || (!selectedVariantId && product.variants?.[0].id === v.id)
                              ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {v.size} - {v.color}
                          <span className="block text-[10px] font-medium opacity-60">Còn {v.available_qty} món</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-2">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-black">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          +
                        </button>
                    </div>
                </div>
             </div>

             <div className="mt-10 flex flex-col gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-rose-600 text-white py-5 rounded-2xl text-lg font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-[0.98]"
                >
                  Thêm Vào Giỏ (Lưu kho 15p)
                </button>
                <p className="text-center text-xs text-gray-400 font-medium">Hệ thống sẽ giữ hàng cho bạn trong 15 phút sau khi thêm vào giỏ.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
