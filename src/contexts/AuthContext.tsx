import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    walletAddress?: string;
    profile_complete?: boolean;
    role?: string;
    cep?: string;
    address?: string;
    city?: string;
    state?: string;
    number?: string;
    district?: string;
    cpf?: string;
    birthDate?: string;
    gender?: string;
    country?: string;
    phone?: string;
    username?: string;

}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    googleLogin: (token: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setWalletAddress: (address: string) => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "luckynft_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const ADMIN_EMAILS = ['brunofpguerra@hotmail.com', 'hedgehogdilemma1851@gmail.com', 'alexanderbeanzllli@gmail.com'];

    useEffect(() => {
        let sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
        // Migration: if old 'user' key exists but session doesn't, migrate
        if (!sessionData) {
            const oldUserData = localStorage.getItem('user');
            if (oldUserData) {
                sessionData = oldUserData;
                localStorage.setItem(SESSION_STORAGE_KEY, oldUserData);
                localStorage.removeItem('user');
            }
        } else {
            // Clean up old duplicate key if it still exists
            localStorage.removeItem('user');
        }
        if (sessionData) {
            try {
                const parsedUser = JSON.parse(sessionData);
                if (ADMIN_EMAILS.includes(parsedUser.email)) {
                    parsedUser.role = 'admin';
                }
                setUser(parsedUser);
            } catch {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.login(email, password);
            console.log("Login response:", response);
            if (response.user) {
                const role = ADMIN_EMAILS.includes(response.user.email) ? 'admin' : (response.user.role || 'user');

                // Ensure ID is string to match interface if needed, API sends number or string
                const sessionUser: User = {
                    id: String(response.user.id),
                    email: response.user.email,
                    name: response.user.name,
                    picture: response.user.picture,
                    walletAddress: response.user.walletAddress,
                    profile_complete: response.user.profile_complete || false,
                    role: role,
                    // Map address fields
                    cep: response.user.cep,
                    address: response.user.address,
                    number: response.user.number,
                    district: response.user.district,
                    city: response.user.city,
                    state: response.user.state
                };
                setUser(sessionUser);
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));

                if (response.token) {
                    localStorage.setItem("auth_token", response.token);
                }

                return { success: true };
            }
            return { success: false, error: "Invalid response from server" };
        } catch (error: any) {
            console.error("Login failed:", error);
            return { success: false, error: error.message || "Erro ao entrar" };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const googleLogin = useCallback(async (token: string) => {
        setIsLoading(true);
        try {
            const response = await api.googleLogin(token);
            console.log("Google Login response:", response);
            if (response.user) {
                const role = ADMIN_EMAILS.includes(response.user.email) ? 'admin' : (response.user.role || 'user');

                const sessionUser: User = {
                    id: String(response.user.id),
                    email: response.user.email,
                    name: response.user.name,
                    picture: response.user.picture,
                    walletAddress: response.user.walletAddress,
                    profile_complete: response.user.profile_complete || false,
                    role: role,
                    // Map address fields
                    cep: response.user.cep,
                    address: response.user.address,
                    number: response.user.number,
                    district: response.user.district,
                    city: response.user.city,
                    state: response.user.state
                };
                setUser(sessionUser);
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));

                if (response.token) {
                    localStorage.setItem("auth_token", response.token);
                }

                toast.success("Login com Google realizado!");
                return { success: true };
            }
            return { success: false, error: "Invalid response" };
        } catch (error: any) {
            console.error("Google Login failed:", error);
            toast.error(error.message || "Falha lo login com Google");
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.register(email, password);
            if (response.user) {
                const role = ADMIN_EMAILS.includes(response.user.email) ? 'admin' : 'user';

                const sessionUser: User = {
                    id: String(response.user.id),
                    email: response.user.email,
                    role: role
                };
                setUser(sessionUser);
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));

                if (response.token) {
                    localStorage.setItem("auth_token", response.token);
                }

                toast.success("Conta criada com sucesso!");
                return { success: true };
            }
            return { success: false, error: "Invalid response" };
        } catch (error: any) {
            console.error("Registration failed:", error);
            return { success: false, error: error.message || "Erro ao registrar" };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
    }, []);

    const setWalletAddress = useCallback((address: string) => {
        if (!user) return;
        const updatedUser = { ...user, walletAddress: address };
        setUser(updatedUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    }, [user]);

    const updateUser = useCallback((data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                googleLogin,
                logout,
                setWalletAddress,
                updateUser,
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
