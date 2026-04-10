"use client";

import Image from "next/image";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import Link from 'next/link';
import { Product } from "@/types/schema";

export default function Home() {
  const { data, error, isLoading } = useSWR<{ items: Product[], meta: any }>('/api/products?limit=8', apiFetch);
  const products = data?.items || [];

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-rose-500 font-bold">Lỗi không thể tải dữ liệu sản phẩm</p>
    </div>
  );

  return (
    <div className="bg-white">
      {}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-500 mix-blend-multiply" />
          <Image
             src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
             alt="Fashion background"
             fill
             sizes="100vw"
             priority
             style={{ objectFit: 'cover' }}
             className="opacity-60"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-md transition-transform hover:scale-105 duration-500 ease-out">
            Định Hình <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Phong Cách</span>
          </h1>
          <p className="mt-4 text-xl text-gray-200 max-w-3xl mb-10 font-light">
            Khám phá bộ sưu tập Mùa Thu 2024 mới nhất. Trải nghiệm hệ thống mua sắm chống cháy hàng thông minh hoàn hảo.
          </p>
          <div className="flex gap-4">
            <Link href="/products" className="inline-block bg-white text-gray-900 font-bold py-4 px-10 border border-transparent rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200">
              Mua Sắm Ngay
            </Link>
            <Link href="/about" className="inline-block bg-transparent text-white font-semibold py-4 px-10 border border-white rounded-full hover:bg-white/10 transition-all duration-200">
              Khám Phá
            </Link>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Mới Cập Nhật</h2>
            <p className="mt-2 text-sm text-gray-500">Các mẫu thời trang bán chạy nhất tuần qua.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-rose-600 hover:text-rose-500 transition-colors">Xem tất cả &rarr;</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-80 w-full rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {products.map((product: Product) => (
              <div key={product.id} className="group relative">
                <div className="relative w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden group-hover:shadow-2xl transition-all duration-300">
                  <Image
                    src={product.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end justify-center p-4">
                    <Link href={`/products/${product.slug}`} className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 w-full bg-white text-center text-gray-900 font-semibold py-3 px-4 rounded-xl shadow-lg hover:bg-gray-100">
                      Xem Chi Tiết
                    </Link>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      <Link href={`/products/${product.slug}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category_name}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {product.min_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.min_price)) : 'Liên hệ'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
