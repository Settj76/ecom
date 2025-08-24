import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import React from "react";
import { AuthProvider } from "@/components/AuthProvider"; // Import the provider

// Load Prompt font with latin + thai subsets
const prompt = Prompt({
    variable: "--font-prompt", // CSS variable name
    subsets: ["latin", "thai"],
    weight: ["400", "500", "600", "700"], // Font weights you plan to use
});

export const metadata: Metadata = {
    title: "My App",
    description: "Next.js + Tailwind + Prompt Thai Font",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" className={prompt.variable}>
        <body className="antialiased">
        {/* Wrap the entire application with the AuthProvider */}
        <AuthProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <main className="container p-4 mx-auto">{children}</main>
        </AuthProvider>
        </body>
        </html>
    );
}
