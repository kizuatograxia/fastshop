import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password);
            setUser(response.user);
            localStorage.setItem("user", JSON.stringify(response.user));
            toast.success("Login realizado com sucesso!");
        } catch (error: any) {
            console.error("Login failed:", error);
            throw error; // Re-throw to let components handle error display
        }
    };

    const register = async (email: string, password: string) => {
        try {
            const response = await api.register(email, password);
            setUser(response.user);
            localStorage.setItem("user", JSON.stringify(response.user));
            toast.success("Conta criada com sucesso!");
        } catch (error: any) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        toast.info("Você saiu da conta.");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
