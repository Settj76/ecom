'use client'; // This is a client component because it handles form state and user interactions.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/AuthProvider';

/**
 * --- HELPER FUNCTION to create a URL-friendly slug ---
 */
const createSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/ /g, '-') // Replace spaces with hyphens
        .replace(/[^\w-]+/g, ''); // Remove all non-word chars
};

/**
 * --- ADD NEW PRODUCT PAGE ---
 */
export default function Page() {
    const router = useRouter();
    const { user } = useAuth();

    // Form state including the new slug field
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- UPDATED NAME HANDLER ---
    // This now updates both the name and the slug state simultaneously.
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        setSlug(createSlug(newName));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name || !price || !stock || !imageFile || !user || !slug) {
            toast.error('Please fill in all required fields.');
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Creating new product...');
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('slug', slug); // Add slug to form data
            formData.append('description', description);
            formData.append('price', price);
            formData.append('stock', stock);
            formData.append('image', imageFile);
            formData.append('created_by', user.id);
            await pb.collection('products').create(formData);
            toast.success('Product created successfully!', { id: toastId });
            router.push('/admin/products');
        } catch (error: any) {
            toast.error(`Failed to create product: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                    Back to Products
                </Link>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" id="name" value={name} onChange={handleNameChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">URL Slug</label>
                            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 bg-gray-50" />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Product preview" className="max-h-full max-w-full object-contain rounded-md" />
                            ) : (
                                <div className="text-center"><UploadCloud className="mx-auto h-10 w-10 text-gray-400" /><p className="mt-2 text-sm">Upload image</p></div>
                            )}
                        </label>
                        <input id="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
