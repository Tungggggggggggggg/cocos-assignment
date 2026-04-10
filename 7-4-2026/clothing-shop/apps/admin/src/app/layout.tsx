import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminAuthGuard from "../components/AdminAuthGuard";
import SidebarNav from "../components/SidebarNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SMART Admin Dashboard",
    description: "Quản trị hệ thống và Kho hàng",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 text-gray-900`}>
                <AdminAuthGuard>
                    <div className="flex h-screen overflow-hidden">
                        {}
                        <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
                            <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-gray-800">
                                SMART Admin
                            </div>
                            <SidebarNav />
                            <div className="p-4 border-t border-gray-800 text-sm opacity-50">
                                User: Master Admin
                            </div>
                        </aside>

                        {}
                        <main className="flex-1 flex flex-col relative overflow-y-auto">
                            <header className="bg-white h-16 shadow-sm flex items-center px-8 justify-between sticky top-0 z-10">
                                <h1 className="font-semibold text-lg">
                                    Hệ thống Điều hành
                                </h1>
                                <div className="flex items-center space-x-4">
                                    <span className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow">
                                        A
                                    </span>
                                </div>
                            </header>
                            <div className="p-8">{children}</div>
                        </main>
                    </div>
                </AdminAuthGuard>
            </body>
        </html>
    );
}
