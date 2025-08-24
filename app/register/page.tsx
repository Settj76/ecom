"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "../../lib/pocketbase"; // Ensure this path is correct

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        try {
            // Data to be sent to PocketBase
            const data = {
                email,
                password,
                passwordConfirm,
                emailVisibility: true, // Required by PocketBase
                // You can add more fields here if they exist in your 'users' collection
                // For example: name: "Test User",
            };

            // Create a new user record
            await pb.collection('users').create(data);

            // Optional: after successful registration, you can directly log the user in
            // await pb.collection('users').authWithPassword(email, password);
            // router.push('/'); // Redirect to homepage after login

            // Or, redirect them to the login page to sign in.
            alert("Registration successful! Please check your email to verify your account before logging in.");
            router.push('/login');

        } catch (err: any) {
            console.error('PocketBase registration error:', err);
            // Provide a more user-friendly error message
            const errorMessage = err.data?.data?.email?.message || err.message || 'Failed to register.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white border rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-900">Create an Account</h1>
                <p className="text-center text-gray-600">Join our community and start shopping!</p>
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
                        placeholder="Password (min. 8 characters)"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                    />
                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
