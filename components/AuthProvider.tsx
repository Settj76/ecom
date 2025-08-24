'use client'; // This component uses client-side hooks (Context, useState, useEffect).

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import pb from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

// Define the shape of the context data.
interface AuthContextType {
    user: RecordModel | null;
    token: string;
    login: (email: string, pass: string) => Promise<any>;
    logout: () => void;
    isLoading: boolean;
}

// Create the context with a default undefined value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component.
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * --- AUTH PROVIDER COMPONENT ---
 * This component wraps your application and provides authentication state
 * (like the current user) to any child component.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<RecordModel | null>(null);
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true); // Start in a loading state

    useEffect(() => {
        // This effect runs once on component mount to check the initial auth state.
        const currentUser = pb.authStore.model;
        const currentToken = pb.authStore.token;

        if (pb.authStore.isValid && currentUser) {
            setUser(currentUser);
            setToken(currentToken);
        }
        setIsLoading(false); // Finished loading, we know the auth state now.

        // Subscribe to auth changes (login, logout).
        const unsubscribe = pb.authStore.onChange((newToken, newModel) => {
            setToken(newToken);
            setUser(newModel);
        }, true); // `true` triggers the callback immediately with the current state.

        // Cleanup function to unsubscribe when the component unmounts.
        return () => {
            unsubscribe();
        };
    }, []);

    const login = async (email: string, pass: string) => {
        // This function will be called from your login page.
        return await pb.collection('users').authWithPassword(email, pass);
    };

    const logout = () => {
        // This function can be called from anywhere to log the user out.
        pb.authStore.clear();
    };

    const value = { user, token, login, logout, isLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * --- CUSTOM HOOK: useAuth ---
 * A helper hook to easily access the auth context from any component.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
