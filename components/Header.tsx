'use client'; // This is a client component because it uses the useAuth hook.

import Link from 'next/link';
import { useAuth } from './AuthProvider'; // Import our custom hook
import { LogOut, UserCircle } from 'lucide-react';

/**
 * --- HEADER COMPONENT ---
 * This header now safely handles authentication state.
 * It shows a loading state initially, then either the user's info or login/register links.
 * This prevents the server from rendering one thing and the client another.
 */
const Header = () => {
    const { user, logout, isLoading } = useAuth();

    const renderAuthLinks = () => {
        // During the initial loading phase, render nothing to avoid mismatch.
        if (isLoading) {
            return <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>;
        }

        // If a user is logged in, show their email and a logout button.
        if (user) {
            return (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-500" />
                        {user.email}
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            );
        }

        // If no user is logged in, show Login and Register links.
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/login"
                    className="px-4 py-2 font-semibold text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                    Login
                </Link>
                <Link
                    href="/register"
                    className="px-4 py-2 font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors"
                >
                    Register
                </Link>
            </div>
        );
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/">
                    <div className="flex items-center gap-2">
                        {/* You can place your logo here */}
                        <span className="text-xl font-bold text-slate-800">E-Commerce</span>
                    </div>
                </Link>
                <div>{renderAuthLinks()}</div>
            </nav>
        </header>
    );
};

export default Header;
