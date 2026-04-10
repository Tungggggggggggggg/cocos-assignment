"use client";

import React from 'react';
import useSWR from 'swr';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  ArrowUpRight, 
  PieChart as PieChartIcon,
  Calendar,
  Package
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

type FinancialSummary = {
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
};

type MonthlyTrend = {
  month: string;
  revenue: string | number;
  profit: string | number;
};

type TopProduct = {
  name: string;
  sku: string;
  size: string;
  color: string;
  total_sold: string | number;
  total_profit: string | number;
};

type FinancialData = {
  summary: FinancialSummary;
  monthlyTrends: MonthlyTrend[];
  topProducts: TopProduct[];
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function FinancialsPage() {
  const { data, isLoading } = useSWR<FinancialData>('/api/reports/financials', apiFetch);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(idx => <div key={idx} className="h-32 bg-gray-100 rounded-3xl" />)}
        </div>
        <div className="h-[400px] bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  const { summary, monthlyTrends, topProducts } = data || {
    summary: { revenue: 0, cogs: 0, profit: 0, margin: 0 },
    monthlyTrends: [],
    topProducts: []
  };

  const chartData = [...monthlyTrends].reverse().map(t => ({
    name: t.month,
    revenue: Number(t.revenue),
    profit: Number(t.profit)
  }));

  const pieData = topProducts.slice(0, 5).map(p => ({
    name: p.name,
    value: Number(p.total_profit)
  }));

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Báo cáo Tài chính</h1>
          <p className="text-gray-500 font-medium text-lg mt-1">Phân tích hiệu suất & lợi nhuận bằng biểu đồ trực quan</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-gray-500 bg-white shadow-sm border border-gray-100 px-6 py-3 rounded-2xl">
          <Calendar size={20} className="text-indigo-500" />
          <span>Thời gian: Theo quý gần nhất</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Tổng Doanh Thu" 
          value={formatCurrency(summary.revenue)} 
          icon={<DollarSign size={24} />}
          sub="Tổng giá trị đơn hàng"
          color="indigo"
        />
        <StatCard 
          title="Lợi Nhuận Gộp" 
          value={formatCurrency(summary.profit)} 
          icon={<TrendingUp size={24} />}
          sub={`${summary.margin.toFixed(1)}% Biên lợi nhuận`}
          color="emerald"
        />
        <StatCard 
          title="Vốn Hàng Bán (COGS)" 
          value={formatCurrency(summary.cogs)} 
          icon={<Package size={24} />}
          sub="Dựa trên giá nhập kho"
          color="amber"
        />
        <StatCard 
          title="Sản Lượng Bán" 
          value={topProducts.reduce((sum, p) => sum + Number(p.total_sold), 0).toString()} 
          icon={<ShoppingBag size={24} />}
          sub="Mặt hàng đã tiêu thụ"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Xu hướng Doanh thu & Lợi nhuận</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" /> Doanh thu</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Lợi nhuận</div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: string | number | readonly (string | number)[] | undefined) => [formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0))), '']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Cơ cấu lợi nhuận</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: string | number | readonly (string | number)[] | undefined) => formatCurrency(Number(Array.isArray(value) ? value[0] : (value || 0)))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <PieChartIcon size={24} className="text-gray-300 mb-1" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TOP 5 MẶT HÀNG</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-gray-900">{((item.value / summary.profit) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Chi tiết lợi nhuận sản phẩm</h3>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Danh sách tinh lọc theo giá trị lợi nhuận mang lại</p>
          </div>
          <ArrowUpRight className="text-gray-300" size={32} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-5">Sản phẩm</th>
                <th className="px-8 py-5">Phân loại</th>
                <th className="px-8 py-5 text-center">Đã bán</th>
                <th className="px-8 py-5 text-right">Tổng lợi nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((prod, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{prod.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">
                    {prod.size} / {prod.color}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-xs font-black">
                      {prod.total_sold}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-sm font-black text-emerald-600">+{formatCurrency(Number(prod.total_profit))}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub, color }: { title: string, value: string, icon: React.ReactNode, sub: string, color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 ring-indigo-500/20',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500/20',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-500/20',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 ring-rose-500/20'
  };

  return (
    <div className={`p-8 rounded-[2rem] border bg-white shadow-sm ring-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mt-1">
          {title}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{value}</h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{sub}</p>
      </div>
    </div>
  );
}
