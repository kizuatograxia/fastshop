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

    getCart: async (userId) => {
        const res = await fetch(`${API_URL}/cart?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
    },

    addToCart: async (userId, product) => {
        const res = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, product }),
        });
        if (!res.ok) throw new Error("Failed to add to cart");
        return res.json();
    },

    removeFromCart: async (userId, productId) => {
        const res = await fetch(`${API_URL}/cart/${productId}?userId=${userId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove from cart");
        return res.json();
    },
};
