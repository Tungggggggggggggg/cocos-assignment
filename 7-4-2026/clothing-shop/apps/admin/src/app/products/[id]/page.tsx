"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { Category, Product } from "@/types/schema";
import ImageUpload from "@/components/ImageUpload";

interface VariantForm {
  id?: string;
  sku: string;
  size: string;
  color: string;
  retailPrice: number;
  isActive: boolean;
  [key: string]: string | number | boolean | undefined;
}

function ProductEditForm({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: product.name || "",
    categoryId: product.category_id || "",
    slug: product.slug || "",
    description: product.description || "",
    imageUrl: product.image_url || "",
    isActive: product.is_active ?? true,
  });

  const [variants, setVariants] = useState<VariantForm[]>(
    product.variants?.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      retailPrice: Number(v.retail_price),
      isActive: v.is_active ?? true,
    })) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...formData, variants }),
      });
      alert("Cập nhật sản phẩm thành công!");
      router.push("/products");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Lỗi khi cập nhật sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-gray-400 uppercase tracking-widest border-b pb-4">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase">Tên sản phẩm</label>
            <input
              type="text"
              required
              className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 ring-indigo-500 transition-all font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase">Slug (Đường dẫn)</label>
            <input
              type="text"
              disabled
              className="w-full bg-gray-100 border-none rounded-xl p-4 opacity-70 cursor-not-allowed font-mono text-sm"
              value={formData.slug}
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
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Chọn danh mục...</option>
              {categories?.map((c: Category) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <ImageUpload value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase">Mô tả</label>
          <textarea
            rows={4}
            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 ring-indigo-500 transition-all font-medium"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-black text-gray-400 uppercase tracking-widest">Biến thể (Variants)</h2>
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
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400">SIZE</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border-none rounded-lg p-2 text-sm"
                  value={v.size}
                  onChange={(e) => updateVariant(index, "size", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400">MÀU</label>
                <input
                  type="text"
                  className="w-full bg-white border-none rounded-lg p-2 text-sm"
                  value={v.color}
                  onChange={(e) => updateVariant(index, "color", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400">GIÁ BÁN</label>
                <input
                  type="number"
                  required
                  className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold text-indigo-600"
                  value={v.retailPrice}
                  onChange={(e) => updateVariant(index, "retailPrice", Number(e.target.value))}
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
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-6 rounded-3xl text-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
      </button>
    </form>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: categories } = useSWR<Category[]>("/api/categories", apiFetch);
  const { data: product, isLoading } = useSWR<Product>(id ? `/api/products/admin/${id}` : null, apiFetch);

  if (isLoading || !categories) return <div className="p-10 text-center">Đang tải dữ liệu sản phẩm...</div>;
  if (!product) return <div className="p-10 text-center text-rose-500">Không tìm thấy sản phẩm</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight text-indigo-600 uppercase">CHỈNH SỬA SẢN PHẨM</h1>
      </div>

      <ProductEditForm product={product} categories={categories} />
    </div>
  );
}
