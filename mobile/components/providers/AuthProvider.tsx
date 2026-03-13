import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/user';
import { storage } from '../../lib/storage';
import { setOnUnauthorizedHandler } from '../../lib/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (userData: User, token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    // Register auto-logout handler for token expiry
    useEffect(() => {
        setOnUnauthorizedHandler(() => {
            signOut();
        });
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, segments, isLoading]);

    async function checkAuth() {
        try {
            // Hydrate all necessary persistence keys into memory cache
            await storage.hydrate(['authToken', 'userData', 'fastshop_cart']);
            
            const token = storage.getToken();
            const userData = storage.getUser();

            if (token && userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to restore auth state', error);
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('userData');
        } finally {
            setIsLoading(false);
        }
    }

    async function signIn(userData: User, token: string) {
        try {
            await SecureStore.setItemAsync('authToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));
            storage.setToken(token); // sync to in-memory for api.ts
            setUser(userData);
        } catch (error) {
            console.error('Failed to store auth state', error);
        }
    }

    async function signOut() {
        await storage.clearAll();
        setUser(null);
        router.replace('/(auth)/login');
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
