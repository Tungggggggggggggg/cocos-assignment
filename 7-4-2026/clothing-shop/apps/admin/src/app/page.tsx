"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { DashboardData, Order } from "@/types/schema";

export default function AdminDashboard() {
  const { data: dashboard, error, isLoading } = useSWR<DashboardData>('/api/reports/dashboard', apiFetch);

  if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải dữ liệu báo cáo...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-bold">Lỗi không thể tải báo cáo quản trị. Vui lòng thử lại sau.</div>;

  const stats = dashboard?.stats || {
    revenue: 0,
    grossProfit: 0,
    orderCount: 0,
    lowStockCount: 0
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">DASHBOARD</h1>
        <p className="text-gray-500">Hiệu suất cửa hàng của bạn hôm nay.</p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Doanh Thu</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Lợi Nhuận Gộp</p>
          <p className="text-2xl font-black text-indigo-600 mt-2">{formatCurrency(stats.grossProfit)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đơn Hàng Mới</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats.orderCount}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tồn Kho Thấp</p>
          <p className="text-2xl font-black text-rose-500 mt-2">{stats.lowStockCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Đơn hàng gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-4">Mã Đơn</th>
                  <th className="px-8 py-4">Khách Hàng</th>
                  <th className="px-8 py-4">Tổng Tiền</th>
                  <th className="px-8 py-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dashboard?.recentOrders?.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 font-bold text-indigo-600">{order.order_no}</td>
                    <td className="px-8 py-4 text-gray-600">{order.customer_name}</td>
                    <td className="px-8 py-4 font-black">{formatCurrency(order.total_amount)}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Cảnh báo tồn kho</h2>
          <div className="space-y-4">
            {dashboard?.inventoryAlerts?.length ? (
              dashboard.inventoryAlerts.map((inv: { product_name: string; sku: string; size: string; color: string; available_qty: number }, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-900">{inv.product_name}</p>
                    <p className="text-xs text-gray-500">SKU: {inv.sku} • {inv.size}-{inv.color}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-600 font-black">{inv.available_qty}</span>
                    <p className="text-[10px] font-bold text-rose-400 uppercase">Sắp hết hàng</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 font-medium">✨ Tất cả hàng hóa đều ổn định</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
