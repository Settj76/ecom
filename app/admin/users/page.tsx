'use client'; // This page uses client-side hooks for state and effects.

import Image from 'next/image';
import pb from '@/lib/pocketbase';
import React, { useState, useEffect, useRef } from 'react';
import { RecordModel } from 'pocketbase';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ReactDOM from 'react-dom';

/**
 * --- TYPE DEFINITION for PocketBase User ---
 */
interface User extends RecordModel {
    firstname: string;
    lastname: string;
    avatar: string;
    email: string;
}

/**
 * --- HELPER FUNCTIONS ---
 */
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatUserName = (user: User) => {
    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    return fullName || 'N/A';
};

/**
 * --- USER TABLE ROW COMPONENT ---
 * Renders a single user row with its own action menu.
 * The menu is rendered in a Portal to escape the table's overflow context.
 */
const UserTableRow = ({ user, onDelete }: { user: User; onDelete: (id: string) => void; }) => {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position the menu just below the button, aligning the right edges.
            // The menu width is 12rem (192px), so we subtract that from the button's right edge.
            setMenuPosition({
                top: rect.bottom + window.scrollY + 5, // 5px buffer
                left: rect.right + window.scrollX - 192,
            });
        }
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleEdit = () => router.push(`/admin/users/edit/${user.id}`);

    const handleDelete = () => {
        setIsMenuOpen(false);
        toast((t) => (
            <div className="flex flex-col items-center gap-2 bg-white px-6 py-4 shadow-lg rounded-lg border">
                <p className="text-center font-semibold">Delete user "{user.email}"?</p>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                <div className="flex gap-3 mt-4">
                    <button onClick={() => toast.dismiss(t.id)} className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => { onDelete(user.id); toast.dismiss(t.id); }} className="w-full rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700">Delete</button>
                </div>
            </div>
        ), { style: { background: 'transparent', boxShadow: 'none', padding: '0' } });
    };

    const MenuPortal = ({ children }: { children: React.ReactNode }) => {
        const [mounted, setMounted] = useState(false);
        useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
        }, []);
        return mounted ? ReactDOM.createPortal(children, document.body) : null;
    };

    return (
        <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap">
                <Image
                    src={user.avatar ? `${process.env.NEXT_PUBLIC_PB_URL}/api/files/users/${user.id}/${user.avatar}` : `https://via.placeholder.com/40/e5e7eb/4b5563.png?text=?`}
                    alt={formatUserName(user)}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-contain bg-gray-200"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatUserName(user)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button ref={buttonRef} onClick={toggleMenu} className="text-gray-400 hover:text-gray-600 p-2 rounded-full">
                    <MoreVertical className="h-5 w-5" />
                </button>
                {isMenuOpen && (
                    <MenuPortal>
                        <div
                            ref={menuRef}
                            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                            className="absolute w-48 bg-white rounded-md shadow-lg z-50 border"
                        >
                            <div className="py-1">
                                <button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Edit className="mr-3 h-4 w-4" />Edit</button>
                                <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="mr-3 h-4 w-4" />Delete</button>
                            </div>
                        </div>
                    </MenuPortal>
                )}
            </td>
        </tr>
    );
};

/**
 * --- USER MANAGEMENT PAGE ---
 */
export default function Page() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const records = await pb.collection('users').getFullList<User>({ sort: '-created' });
                setUsers(records);
            } catch (err) {
                setError("Failed to load users. You may need admin privileges.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        const toastId = toast.loading('Deleting user...');
        try {
            await pb.collection('users').delete(userId);
            toast.success('User deleted successfully!', { id: toastId });
            setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
        } catch (error: any) {
            toast.error(`Failed to delete user: ${error.message}`, { id: toastId });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Loading users...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-red-500">{error}</td></tr>
                        ) : users.length > 0 ? (
                            users.map((user) => <UserTableRow key={user.id} user={user} onDelete={handleDeleteUser} />)
                        ) : (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">No users found.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
