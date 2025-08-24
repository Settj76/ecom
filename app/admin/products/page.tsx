'use client'; // This page uses client-side hooks for state and effects.

import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, MoreVertical, Trash2, Edit } from 'lucide-react';
import pb from '@/lib/pocketbase';
import { Product } from '@/components/ProductCard'; // Reuse the Product type definition
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

/**
 * --- HELPER FUNCTIONS (CLIENT-SIDE) ---
 */
const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * --- PRODUCT TABLE ROW (CLIENT COMPONENT) ---
 * This component renders a single product row and manages its own action menu (dropdown).
 */
const ProductTableRow = ({ product, onDelete }: { product: Product; onDelete: (id: string) => void; }) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close the menu if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEdit = () => {
        // Navigate to a dynamic edit page for this product
        router.push(`/admin/products/edit/${product.id}`);
    };

    // --- UPDATED DELETE HANDLER ---
    // This now uses react-hot-toast to show a custom confirmation dialog.
    const handleDelete = () => {
        setIsMenuOpen(false); // Close the dropdown menu

        toast((t) => (
            <div className="flex flex-col items-center gap-2 bg-white px-6 py-4 shadow-lg rounded-lg border">
                <p className="text-center font-semibold">
                    Delete "{product.name}"?
                </p>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onDelete(product.id);
                            toast.dismiss(t.id);
                        }}
                        className="w-full rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: 10000, // Keep the toast open until the user interacts with it
            // --- CUSTOM STYLING ---
            // These styles make the toast container itself transparent and remove its default shadow.
            style: {
                background: 'transparent',
                boxShadow: 'none',
                padding: '0',
            },
        });
    };

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <Image
                    src={`${process.env.NEXT_PUBLIC_PB_URL}/api/files/${product.collectionId}/${product.id}/${product.image}`}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(product.price)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(product.created)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                                <button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Edit className="mr-3 h-4 w-4" />
                                    Edit
                                </button>
                                <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};


/**
 * --- ADMIN PRODUCTS PAGE ---
 * Fetches and displays a list of all products, with management options.
 */
export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const records = await pb.collection('products').getFullList<Product>({ sort: '-created' });
            setProducts(records);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (productId: string) => {
        const toastId = toast.loading('Deleting product...');
        try {
            await pb.collection('products').delete(productId);
            toast.success('Product deleted successfully!', { id: toastId });
            // Refresh the product list by filtering out the deleted product
            setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
        } catch (error: any) {
            console.error("Failed to delete product:", error);
            toast.error(`Failed to delete product: ${error.message}`, { id: toastId });
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                    Add New Product
                </Link>
            </div>

            {/* Products Table */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                    Loading products...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <ProductTableRow key={product.id} product={product} onDelete={handleDeleteProduct} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
