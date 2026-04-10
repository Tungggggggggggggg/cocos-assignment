"use client";

import useSWR, { mutate } from "swr";
import { apiFetch } from "@/lib/api";
import Link from 'next/link';
import { Product } from "@/types/schema";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const { data: products, isLoading } = useSWR<{ items: Product[]; meta: { total: number; page: number; limit: number; totalPages: number } }>('/api/products', apiFetch);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn lưu trữ (xóa) sản phẩm này?")) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      mutate('/api/products');
      alert("Đã xóa sản phẩm thành công");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📦 QUẢN LÝ SẢN PHẨM</h1>
          <p className="text-gray-500 text-sm">Xem và cập nhật danh sách hàng hóa trong kho</p>
        </div>
        <Link href="/products/new" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
          + Thêm Sản Phẩm
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải danh sách sản phẩm...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá bán thấp nhất</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products?.items?.map((p: Product) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">{p.category_name}</td>
                  <td className="px-6 py-4 font-black">
                    {formatCurrency(p.min_price || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.is_active ? 'Đang bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Link 
                      href={`/products/${p.id}`}
                      className="text-indigo-600 hover:underline font-bold text-sm"
                    >
                      Sửa
                    </Link>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="text-rose-600 hover:underline font-bold text-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {products?.items?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                    Chưa có sản phẩm nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
