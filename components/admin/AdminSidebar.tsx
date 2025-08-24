'use client'; // This must be a client component to use the usePathname hook.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users2,
    CreditCard,
    Settings,
    LogOut,
} from 'lucide-react';

// An array of navigation links for the admin panel.
const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users2 },
    { name: 'Top-ups', href: '/admin/topups', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

/**
 * --- ADMIN SIDEBAR COMPONENT ---
 * A responsive navigation sidebar for the admin section of the application.
 * It uses the `usePathname` hook to highlight the currently active link.
 */
const AdminSidebar = () => {
    const pathname = usePathname(); // Get the current URL path

    return (
        <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
            {/* Logo or Site Title */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
                <Link href="/admin/dashboard">
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow px-2 py-4">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center px-4 py-2.5 my-1 rounded-md text-sm font-medium transition-colors
                                ${
                                isActive
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <link.icon className="mr-3 h-5 w-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout Section */}
            <div className="px-2 py-4 border-t border-gray-700">
                <button
                    // TODO: Implement logout functionality
                    onClick={() => console.log('Logout clicked')}
                    className="flex w-full items-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
