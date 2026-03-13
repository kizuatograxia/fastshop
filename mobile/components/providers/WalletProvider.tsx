import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { NFT, OwnedNFT } from "../../types/raffle";
import { api } from "../../lib/api";
import { useAuth } from "./AuthProvider";
import { storage } from "../../lib/storage";
import { Alert } from "react-native";
import * as Haptics from 'expo-haptics';

interface WalletContextType {
    cartItems: OwnedNFT[];
    addToCart: (nft: NFT) => void;
    removeFromCart: (nftId: string) => void;
    clearCart: () => void;
    ownedNFTs: OwnedNFT[];
    balance: number;
    buyNFTs: (items: { id: string; quantity: number }[], couponCode?: string) => Promise<void>;
    getTotalNFTs: () => number;
    hasNFT: (nftId: string) => boolean;
    getNFTCount: (nftId: string) => number;
    refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
    const [cartItems, setCartItems] = useState<OwnedNFT[]>([]);
    const [balance] = useState(0);

    // Sync wallet from backend when user changes
    useEffect(() => {
        if (user) {
            refreshWallet();
        } else {
            setOwnedNFTs([]);
        }
    }, [user]);

    // Load cart from storage once auth hydration is done
    useEffect(() => {
        if (!isAuthLoading) {
            loadCart();
        }
    }, [isAuthLoading]);

    const loadCart = async () => {
        try {
            const saved = storage.getItem("fastshop_cart");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        }
    };

    const saveCart = async (items: OwnedNFT[]) => {
        try {
            storage.setItem("fastshop_cart", JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    };

    const refreshWallet = async () => {
        if (!user) return;
        const token = storage.getToken();
        if (!token) {
            // No valid session — skip silently
            return;
        }
        try {
            const data = await api.getWallet(Number(user.id));
            setOwnedNFTs(data);
        } catch (err: any) {
            if (err?.message?.includes('Token') || err?.message?.includes('expirado') || err?.message?.includes('401')) {
                // Token expired silently — user will re-login
                return;
            }
            console.error("Failed to load wallet", err);
        }
    };

    const addToCart = useCallback((nft: NFT) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCartItems((current) => {
            const existing = current.find((item) => item.id === nft.id);
            let next: OwnedNFT[];
            if (existing) {
                next = current.map((item) =>
                    item.id === nft.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            } else {
                next = [...current, { ...nft, quantidade: 1 }];
            }
            saveCart(next);
            return next;
        });
    }, []);

    const removeFromCart = useCallback((nftId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCartItems((current) => {
            const existing = current.find((item) => item.id === nftId);
            if (!existing) return current;

            let next: OwnedNFT[];
            if (existing.quantidade <= 1) {
                next = current.filter((item) => item.id !== nftId);
            } else {
                next = current.map((item) =>
                    item.id === nftId
                        ? { ...item, quantidade: item.quantidade - 1 }
                        : item
                );
            }
            saveCart(next);
            return next;
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        saveCart([]);
    }, []);

    const buyNFTs = useCallback(async (items: { id: string; quantity: number }[], couponCode?: string) => {
        if (!user) return;
        const token = storage.getToken();
        if (!token) {
            Alert.alert('Sessão expirada', 'Faça login novamente para continuar.');
            return;
        }
        try {
            await api.buyNFTs(Number(user.id), items, couponCode);
            await refreshWallet();
        } catch (error) {
            console.error("Failed to buy NFTs", error);
            throw error;
        }
    }, [user]);

    const getTotalNFTs = useCallback(() => {
        return cartItems.reduce((sum, nft) => sum + nft.quantidade, 0);
    }, [cartItems]);

    const hasNFT = useCallback((nftId: string) => {
        return ownedNFTs.some((nft) => nft.id === nftId && nft.quantidade > 0);
    }, [ownedNFTs]);

    const getNFTCount = useCallback((nftId: string) => {
        const nft = ownedNFTs.find((owned) => owned.id === nftId);
        return nft?.quantidade ?? 0;
    }, [ownedNFTs]);

    return (
        <WalletContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
                ownedNFTs,
                balance,
                buyNFTs,
                getTotalNFTs,
                hasNFT,
                getNFTCount,
                refreshWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
