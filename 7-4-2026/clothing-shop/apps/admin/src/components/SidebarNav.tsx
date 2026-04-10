"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '📊 Dashboard', id: 'nav-dashboard' },
    { href: '/financials', label: '💰 Tài chính', id: 'nav-financials' },
    { href: '/orders', label: '🛍️ Đơn hàng', id: 'nav-orders' },
    { href: '/inventory', label: '📦 Kho hàng', id: 'nav-inventory' },
    { href: '/products', label: '🏷️ Sản phẩm', id: 'nav-products' },
  ];

  const posItem = { href: '/pos', label: '💳 Cổng POS', id: 'nav-pos' };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map((item) => (
        <Link 
          key={item.href}
          id={item.id}
          href={item.href} 
          className={`block px-4 py-2.5 rounded-lg transition-all ${
            isActive(item.href) 
              ? 'bg-gray-800 text-white shadow-inner font-bold' 
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          {item.label}
        </Link>
      ))}
      <Link 
        id={posItem.id}
        href={posItem.href} 
        className={`block px-4 py-2.5 rounded-lg transition-all font-bold border-t border-gray-800 mt-4 pt-4 ${
          isActive(posItem.href)
            ? 'bg-emerald-900/30 text-emerald-400'
            : 'text-emerald-500/80 hover:bg-gray-800 hover:text-emerald-400'
        }`}
      >
        {posItem.label}
      </Link>
    </nav>
  );
}
