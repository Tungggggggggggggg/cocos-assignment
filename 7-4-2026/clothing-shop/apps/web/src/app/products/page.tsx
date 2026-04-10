"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/schema";
import { formatCurrency } from "@/lib/utils";

interface ProductMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const [categoryId, setCategoryId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const limit = 12;
    const { data, error, isLoading } = useSWR<{
        items: Product[];
        meta: ProductMeta;
    }>(
        `/api/products?page=${page}&limit=${limit}${categoryId ? `&categoryId=${categoryId}` : ""}${searchTerm ? `&q=${searchTerm}` : ""}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}`,
        apiFetch,
    );

    const { data: categories } = useSWR<{ id: string; name: string }[]>(
        "/api/categories",
        apiFetch,
    );

    const products = data?.items || [];
    const meta = data?.meta;

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-black text-gray-900 mb-8">
                    Cửa Hàng
                </h1>

                {}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full px-6 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full px-6 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium appearance-none"
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Giá từ..."
                            className="w-1/2 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                setPage(1);
                            }}
                        />
                        <input
                            type="number"
                            placeholder="Đến..."
                            className="w-1/2 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                {}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-80 w-full rounded-2xl mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-rose-500">Lỗi tải dữ liệu</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative"
                                >
                                    <div className="relative w-full h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                        <Image
                                            src={
                                                product.image_url ||
                                                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop"
                                            }
                                            alt={product.name}
                                            fill
                                            className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-end p-4">
                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="w-full bg-white text-center py-3 rounded-xl font-bold text-gray-900 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                                            >
                                                Xem Chi Tiết
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-sm font-bold text-gray-900">
                                            <Link
                                                href={`/products/${product.slug}`}
                                            >
                                                {product.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {product.category_name}
                                        </p>
                                        <p className="mt-1 text-sm font-black text-rose-600">
                                            {formatCurrency(
                                                Number(product.min_price || 0),
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {}
                        {meta && meta.totalPages > 1 && (
                            <div className="mt-20 flex justify-center items-center gap-4">
                                <button
                                    disabled={page === 1}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    className="px-6 py-2 rounded-xl border border-gray-200 disabled:opacity-30 font-bold hover:bg-gray-50 transition-all"
                                >
                                    &larr; Trước
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(meta.totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "hover:bg-gray-100"}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={page === meta.totalPages}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(meta.totalPages, p + 1),
                                        )
                                    }
                                    className="px-6 py-2 rounded-xl border border-gray-200 disabled:opacity-30 font-bold hover:bg-gray-50 transition-all"
                                >
                                    Sau &rarr;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
