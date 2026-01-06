import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface User {
    id: string;
    email: string;
    walletAddress?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setWalletAddress: (address: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "luckynft_users";
const SESSION_STORAGE_KEY = "luckynft_session";

interface StoredUser {
    id: string;
    email: string;
    password: string;
    walletAddress?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionData) {
            try {
                const parsedUser = JSON.parse(sessionData);
                setUser(parsedUser);
            } catch {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const getStoredUsers = (): StoredUser[] => {
        const data = localStorage.getItem(USERS_STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    };

    const saveStoredUsers = (users: StoredUser[]) => {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    };

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const users = getStoredUsers();
            const foundUser = users.find(
                (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (!foundUser) {
                return { success: false, error: "Email ou senha incorretos" };
            }

            const sessionUser: User = {
                id: foundUser.id,
                email: foundUser.email,
                walletAddress: foundUser.walletAddress,
            };

            setUser(sessionUser);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
            return { success: true };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const users = getStoredUsers();
            const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                return { success: false, error: "Este email já está cadastrado" };
            }

            const newUser: StoredUser = {
                id: crypto.randomUUID(),
                email: email.toLowerCase(),
                password,
            };

            users.push(newUser);
            saveStoredUsers(users);

            const sessionUser: User = {
                id: newUser.id,
                email: newUser.email,
            };

            setUser(sessionUser);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
            return { success: true };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }, []);

    const setWalletAddress = useCallback((address: string) => {
        if (!user) return;

        const updatedUser = { ...user, walletAddress: address };
        setUser(updatedUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));

        const users = getStoredUsers();
        const userIndex = users.findIndex((u) => u.id === user.id);
        if (userIndex >= 0) {
            users[userIndex].walletAddress = address;
            saveStoredUsers(users);
        }
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                setWalletAddress,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
