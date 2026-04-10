"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Category } from "@/types/schema";
import ImageUpload from "@/components/ImageUpload";

interface VariantForm {
  sku: string;
  size: string;
  color: string;
  retailPrice: number;
  isActive: boolean;
  [key: string]: string | number | boolean | undefined;
}

export default function NewProductPage() {
  const router = useRouter();
  const { data: categories } = useSWR<Category[]>('/api/categories', apiFetch);
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  const [variants, setVariants] = useState<VariantForm[]>([
    { sku: "", size: "", color: "", retailPrice: 0, isActive: true }
  ]);

  const addVariant = () => {
    setVariants([...variants, { sku: "", size: "", color: "", retailPrice: 0, isActive: true }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string | number | boolean) => {
    const newVariants = [...variants];
    const target = newVariants[index];
    if (target) {
      (target as Record<string, string | number | boolean>)[field] = value;
    }
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ ...formData, variants })
      });
      alert("Tạo sản phẩm thành công!");
      router.push("/products");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Lỗi khi tạo sản phẩm");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-center justify-between">
         <button onClick={() => router.back()} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2">
            ← Quay lại
         </button>
         <h1 className="text-3xl font-black text-gray-900 tracking-tight">TẠO SẢN PHẨM MỚI</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-indigo-600 uppercase tracking-widest border-b pb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase">Tên sản phẩm</label>
              <input 
                type="text" 
                required
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 ring-indigo-500 transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ví dụ: Áo Thun Premium Cotton"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase">Slug (Đường dẫn)</label>
              <input 
                type="text" 
                required
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 ring-indigo-500 transition-all font-mono text-sm"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="ao-thun-premium-cotton"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase">Danh mục</label>
              <select 
                required
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 ring-indigo-500 transition-all font-medium"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Chọn danh mục...</option>
                {categories?.map((c: Category) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            {/* New Image Upload Component */}
            <ImageUpload 
              value={formData.imageUrl} 
              onChange={(url) => setFormData({...formData, imageUrl: url})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase">Mô tả</label>
            <textarea 
              rows={4}
              className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 ring-indigo-500 transition-all font-medium"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-black text-indigo-600 uppercase tracking-widest">Biến thể (Variants)</h2>
            <button 
              type="button"
              onClick={addVariant}
              className="text-xs font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              + THÊM BIẾN THỂ
            </button>
          </div>
          
          <div className="space-y-4">
            {variants.map((v, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end relative">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400">SKU</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white border-none rounded-lg p-2 text-sm font-mono"
                    value={v.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400">SIZE</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white border-none rounded-lg p-2 text-sm"
                    value={v.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    placeholder="M, L, XL..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400">MÀU</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border-none rounded-lg p-2 text-sm"
                    value={v.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    placeholder="Đen, Trắng..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400">GIÁ BÁN</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold text-indigo-600"
                    value={v.retailPrice}
                    onChange={(e) => updateVariant(index, 'retailPrice', Number(e.target.value))}
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length === 1}
                  className="text-rose-500 hover:text-rose-700 transition-colors text-xs font-black h-9 flex items-center justify-center disabled:opacity-30"
                >
                  XÓA
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-6 rounded-3xl text-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
        >
          XÁC NHẬN TẠO SẢN PHẨM
        </button>
      </form>
    </div>
  );
}
