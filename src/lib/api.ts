export const API_URL = "http://localhost:5050/api";

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
    },

    register: async (email, password) => {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
    },

    getWallet: async (userId: number) => {
        const res = await fetch(`${API_URL}/wallet?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch wallet");
        return res.json();
    },

    addToWallet: async (userId: number, nft: any) => {
        const res = await fetch(`${API_URL}/wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nft }),
        });
        if (!res.ok) throw new Error("Failed to add to wallet");
        return res.json();
    },

    removeFromWallet: async (userId: number, nftId: string, quantity: number = 1) => {
        const res = await fetch(`${API_URL}/wallet/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nftId, quantity }),
        });
        if (!res.ok) throw new Error("Failed to remove from wallet");
        return res.json();
    },
};
