"use client";

import { useState } from "react";
import pb from "../../lib/pocketbase"; // Make sure this path is correct
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const authData = await pb.collection('users').authWithPassword(email, password);

            // After successful login, the authStore is updated automatically.
            // The AuthProvider will detect this change and update the UI.

            // authData.record contains user info after login
            const user = authData.record;

            // Example: assuming user.role exists in your PocketBase collection
            // and you've set it up for your users (e.g., 'admin', 'user').
            if (user && (user as any).role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            console.error('PocketBase login error:', err);
            setError(err.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white border rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-900">ยินดีต้อนรับกลับมา!</h1>
                <p className="text-center text-gray-600">Login to continue to your account.</p>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Don't have an account yet?{' '}
                    <Link href="/register" className="font-medium text-blue-600 hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
