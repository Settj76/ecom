'use client'; // This is a client component for form state and user interactions.

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, UploadCloud } from 'lucide-react';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Expanded User interface to include all editable fields
interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone_no: string;
    role: 'user' | 'admin';
    credit: number;
    avatar: string;
    verify_phone: boolean;
    verified: boolean; // This is the built-in PocketBase field for email verification
    address: string;
    collectionId: string;
}

/**
 * --- EDIT USER PAGE ---
 * This component fetches a single user's data and allows an admin to edit it.
 */
export default function Page() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    // Form state for all user fields
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [credit, setCredit] = useState('');
    const [address, setAddress] = useState('');
    const [verifyPhone, setVerifyPhone] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Effect to fetch user data on component mount
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const user = await pb.collection('users').getOne<User>(userId);
                setFirstname(user.firstname || '');
                setLastname(user.lastname || '');
                setEmail(user.email);
                setPhoneNo(user.phone_no || '');
                setRole(user.role || 'user');
                setCredit(user.credit?.toString() || '0');
                setAddress(user.address || '');
                setVerifyPhone(user.verify_phone || false);
                setVerifyEmail(user.verified || false); // Use the correct 'verified' field
                if (user.avatar) {
                    setAvatarPreview(`${process.env.NEXT_PUBLIC_PB_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`);
                }
            } catch (error) {
                toast.error("Could not load user data.");
                router.push('/admin/users');
            } finally {
                setIsFetching(false);
            }
        };
        fetchUser();
    }, [userId, router]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // --- FINALIZED SUBMISSION HANDLER ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Updating user...');

        try {
            // Always use FormData to ensure consistent data types are sent.
            const formData = new FormData();

            // Append all text-based fields
            formData.append('firstname', firstname);
            formData.append('lastname', lastname);
            formData.append('email', email);
            formData.append('phone_no', phoneNo);
            formData.append('role', role);
            formData.append('credit', credit);
            formData.append('address', address);

            formData.append('verify_phone', verifyPhone ? 'true' : 'false');
            formData.append('verify_email', verifyEmail ? 'true' : 'false');


            // Only append the avatar if a new one was selected
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await pb.collection('users').update(userId, formData);

            toast.success('User updated successfully!', { id: toastId });
            router.push('/admin/users');

        } catch (error: any) {
            console.error("--- POCKETBASE UPDATE FAILED ---");
            console.error("Full error response:", error.originalError || error);

            let errorMessage = "Failed to update record.";
            if (error.data?.data) {
                const errors = error.data.data;
                const fieldErrors = Object.keys(errors).map(key => `${key}: ${errors[key].message}`);
                errorMessage = `Update failed: ${fieldErrors.join(', ')}`;
            }

            toast.error(errorMessage, { id: toastId, duration: 6000 });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Link href="/admin/users" className="flex items-center gap-2 text-gray-500 hover:text-gray-800">
                <ArrowLeft className="h-5 w-5" />
                Back to Users
            </Link>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Avatar</label>
                        <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            {avatarPreview ? (
                                <Image src={avatarPreview} alt="Avatar preview" width={192} height={192} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-center">
                                    <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Upload new avatar</p>
                                </div>
                            )}
                        </label>
                        <input id="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phoneNo" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                        <div>
                            <label htmlFor="credit" className="block text-sm font-medium text-gray-700">Credit</label>
                            <input type="number" id="credit" value={credit} onChange={(e) => setCredit(e.target.value)} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2" />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'user' | 'admin')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                        <label htmlFor="verifyEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" id="verifyEmail" checked={verifyEmail} onChange={(e) => setVerifyEmail(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" />
                            Email Verified
                        </label>
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                        <label htmlFor="verifyPhone" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" id="verifyPhone" checked={verifyPhone} onChange={(e) => setVerifyPhone(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" />
                            Phone Verified
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-800 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
