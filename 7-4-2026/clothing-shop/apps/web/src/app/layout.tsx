import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'S.M.A.R.T Clothing | Premium Fashion',
  description: 'Cửa hàng thời trang cao cấp với hệ thống đặt hàng thông minh.',
};

import Navbar from '../components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen bg-neutral-50 text-gray-900 antialiased`}>
        <Navbar />

        {}
        <main className="pt-16">
          {children}
        </main>

        <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-black text-white text-xl tracking-tighter mb-2">S.M.A.R.T</p>
            <p className="text-sm">© 2025 Smart Clothing. Hệ thống quản lý kho & bán hàng thông minh.</p>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <a href="http://localhost:3002" className="text-xs text-gray-600 hover:text-indigo-400 transition-colors uppercase tracking-widest font-black">
                🔒 Truy cập Cổng Quản Trị (Admin Portal)
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
