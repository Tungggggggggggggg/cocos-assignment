"use client";

import useSWR, { mutate } from "swr";
import { apiFetch } from "@/lib/api";
import { Order } from "@/types/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useSWR<Order[]>('/api/orders/admin', apiFetch);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      mutate('/api/orders/admin');
      alert(`Đã cập nhật đơn hàng thành ${newStatus}`);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📑 QUẢN LÝ ĐƠN HÀNG</h1>
        <p className="text-gray-500 text-sm">Theo dõi và vận hành các đơn đặt hàng</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Đang tải danh sách đơn hàng...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Tổng Tiền</th>
                <th className="px-6 py-4">Ngày Đặt</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders?.map((o: Order) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600">{o.order_no}</td>
                  <td className="px-6 py-4 font-medium">{o.customer_name}</td>
                  <td className="px-6 py-4 font-black">
                    {formatCurrency(o.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {formatDate(o.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      (o.status === 'pending' || o.status === 'processing') ? 'bg-amber-100 text-amber-700' :
                      o.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                      o.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {o.status === 'delivered' ? 'THÀNH CÔNG' :
                       (o.status === 'pending' || o.status === 'processing') ? 'ĐANG XỬ LÝ' :
                       o.status === 'shipped' ? 'ĐANG GIAO HÀNG' : 'HỦY'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <select 
                       className="text-xs border rounded p-1 focus:ring-1 ring-indigo-500"
                       value={o.status}
                       onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                     >
                        <option value="pending">ĐANG XỬ LÝ (Mới)</option>
                        <option value="processing">ĐANG XỬ LÝ (Sẵn sàng)</option>
                        <option value="shipped">ĐANG GIAO HÀNG</option>
                        <option value="delivered">THÀNH CÔNG</option>
                        <option value="cancelled">HỦY</option>
                     </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
