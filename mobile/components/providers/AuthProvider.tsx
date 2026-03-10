import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/user';
import { storage } from '../../lib/storage';

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
            const token = await SecureStore.getItemAsync('authToken');
            const userDataStr = await SecureStore.getItemAsync('userData');

            if (token && userDataStr) {
                storage.setToken(token); // sync to in-memory
                setUser(JSON.parse(userDataStr));
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
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userData');
        storage.removeToken(); // clear in-memory
        setUser(null);
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
