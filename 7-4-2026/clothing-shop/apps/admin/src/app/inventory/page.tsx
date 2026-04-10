"use client";
import React from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

type InventoryLog = {
  id: string;
  type: string;
  quantity_delta: string | number;
  created_at: string;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  operator_name?: string;
};

export default function AdminInventoryPage() {
  const { data: logs, isLoading } = useSWR<InventoryLog[]>('/api/inventory/logs', apiFetch);

  const getTypeText = (type: string) => {
    switch (type) {
      case 'import': return 'Nhập hàng';
      case 'pos_sale': return 'Bán lẻ (POS)';
      case 'checkout': return 'Bán Online';
      case 'manual_adj': return 'Điều chỉnh';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📦 NHẬT KÝ KHO HÀNG</h1>
          <p className="text-gray-500 text-sm">Quản lý biến động xuất nhập tồn</p>
        </div>
        <Link href="/inventory/new" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
          👉 Tạo Phiếu Nhập Hàng
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400">Đang tải nhật ký kho...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Loại GD</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {logs?.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {new Date(t.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    <div>{t.product_name}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{t.sku} • {t.size} / {t.color}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${t.type === 'import' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {getTypeText(t.type)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-black ${Number(t.quantity_delta) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {Number(t.quantity_delta) > 0 ? `+${t.quantity_delta}` : t.quantity_delta}
                  </td>
                  <td className="px-6 py-4 italic text-gray-400">{t.operator_name || 'Hệ thống'}</td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                    Chưa có biến động kho nào được ghi nhận.
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
