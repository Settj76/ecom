import AdminSidebar from "@/components/admin/AdminSidebar";
import React from "react";


export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* The sidebar component is rendered here */}
            <AdminSidebar />

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* The content of the specific admin page will be rendered here */}
                    {children}
                </div>
            </main>
        </div>
    );
}
