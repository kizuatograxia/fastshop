import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { NFT, OwnedNFT } from "@/types/raffle";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WalletContextType {
    cartItems: OwnedNFT[];
    addToCart: (nft: NFT) => void;
    removeFromCart: (nftId: string) => void;
    clearCart: () => void;
    ownedNFTs: OwnedNFT[];
    balance: number;
    addNFT: (nft: NFT) => Promise<void>;
    buyNFTs: (items: { id: string; quantity: number }[]) => Promise<void>;
    removeNFT: (nftId: string, quantidade?: number) => Promise<void>;
    getTotalNFTs: () => number;
    hasNFT: (nftId: string) => boolean;
    getNFTCount: (nftId: string) => number;
    refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
    const [cartItems, setCartItems] = useState<OwnedNFT[]>([]);
    const [balance] = useState(0);

    // Load wallet from backend when user changes
    useEffect(() => {
        if (user) {
            api.getWallet(Number(user.id))
                .then((data) => setOwnedNFTs(data))
                .catch((err) => console.error("Failed to load wallet", err));
        } else {
            setOwnedNFTs([]);
        }
    }, [user]);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem("fastshop_cart");
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem("fastshop_cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((nft: NFT) => {
        setCartItems((current) => {
            const existing = current.find((item) => item.id === nft.id);
            if (existing) {
                return current.map((item) =>
                    item.id === nft.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }
            return [...current, { ...nft, quantidade: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((nftId: string) => {
        setCartItems((current) => {
            const existing = current.find((item) => item.id === nftId);
            if (!existing) return current;

            if (existing.quantidade <= 1) {
                return current.filter((item) => item.id !== nftId);
            }

            return current.map((item) =>
                item.id === nftId
                    ? { ...item, quantidade: item.quantidade - 1 }
                    : item
            );
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);


    const addNFT = useCallback(async (nft: NFT) => {
        if (!user) {
            toast.error("Você precisa estar logado para comprar NFTs");
            return;
        }

        try {
            // Optimistic update
            setOwnedNFTs((current) => {
                const existing = current.find((owned) => owned.id === nft.id);
                if (existing) {
                    return current.map((owned) =>
                        owned.id === nft.id
                            ? { ...owned, quantidade: owned.quantidade + 1 }
                            : owned
                    );
                }
                return [...current, { ...nft, quantidade: 1 }];
            });

            // API call
            await api.addToWallet(Number(user.id), nft);
        } catch (error) {
            console.error("Failed to add NFT", error);
            toast.error("Erro ao comprar NFT");
            // Revert optimistic update? For simplicity, we'll reload
            api.getWallet(Number(user.id)).then(setOwnedNFTs);
        }
    }, [user]);

    const removeNFT = useCallback(async (nftId: string, quantidade: number = 1) => {
        if (!user) return;

        try {
            // Optimistic update
            setOwnedNFTs((current) => {
                const existing = current.find((owned) => owned.id === nftId);
                if (!existing) return current;

                if (existing.quantidade <= quantidade) {
                    return current.filter((owned) => owned.id !== nftId);
                }

                return current.map((owned) =>
                    owned.id === nftId
                        ? { ...owned, quantidade: owned.quantidade - quantidade }
                        : owned
                );
            });

            // API call
            await api.removeFromWallet(Number(user.id), nftId, quantidade);
        } catch (error) {
            console.error("Failed to remove NFT", error);
            toast.error("Erro ao usar NFT");
            api.getWallet(Number(user.id)).then(setOwnedNFTs);
        }
    }, [user]);

    const buyNFTs = useCallback(async (items: { id: string; quantity: number }[]) => {
        if (!user) return;
        try {
            await api.buyNFTs(Number(user.id), items);
            // Refresh wallet
            const data = await api.getWallet(Number(user.id));
            setOwnedNFTs(data);
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
                addNFT,
                buyNFTs,
                removeNFT,
                getTotalNFTs,
                hasNFT,
                getNFTCount,
                refreshWallet: () => api.getWallet(Number(user?.id)).then(setOwnedNFTs),
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
