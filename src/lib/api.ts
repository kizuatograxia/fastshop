// Hardcoded fallback for production debug
const PROD_URL = "https://mundopix-production.up.railway.app/api";
export const API_URL = import.meta.env.VITE_API_URL || PROD_URL;
console.log("API URL configured as:", API_URL);

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

    googleLogin: async (credential: string) => {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credential }),
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

    // Raffles
    getActiveRaffles: async () => {
        const res = await fetch(`${API_URL}/raffles`);
        if (!res.ok) throw new Error("Failed to fetch raffles");
        const data = await res.json();

        // Map backend fields to frontend interface
        return data.map((r: any) => ({
            id: String(r.id),
            titulo: r.title,
            descricao: r.description,
            premio: r.prize_pool,
            premioValor: r.prize_value || 0,
            imagem: r.image_url,
            dataFim: r.draw_date,
            participantes: parseInt(r.tickets_sold) || 0,
            maxParticipantes: r.max_tickets,
            custoNFT: r.ticket_price,
            status: r.status === 'active' ? 'ativo' : 'encerrado',
            categoria: r.category || 'tech',
            raridade: r.rarity || 'comum'
        }));
    },

    getRaffle: async (id: string) => {
        const res = await fetch(`${API_URL}/raffles/${id}`);
        if (!res.ok) throw new Error("Failed to fetch raffle details");
        return res.json();
    },

    getRaffleParticipants: async (id: string) => {
        const res = await fetch(`${API_URL}/raffles/${id}/participants`);
        if (!res.ok) throw new Error("Failed to fetch participants");
        return res.json();
    },

    joinRaffle: async (raffleId: number, userId: number, ticketCount: number, txHash?: string) => {
        const res = await fetch(`${API_URL}/raffles/${raffleId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, ticketCount, txHash }),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
    },

    getUserRaffles: async (userId: number) => {
        const res = await fetch(`${API_URL}/user/raffles?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user raffles");
        const data = await res.json();
        // Ensure IDs are strings to match frontend types
        return data.map((ur: any) => ({
            ...ur,
            raffle: {
                id: String(ur.raffle.id),
                titulo: ur.raffle.title,
                descricao: ur.raffle.description,
                imagem: ur.raffle.image,
                premio: ur.raffle.prize,
                premioValor: ur.raffle.prizeValue || 0,
                dataFim: ur.raffle.drawDate,
                custoNFT: ur.raffle.price,
                participantes: 0, // Not provided in user raffle summary usually, or maybe we need to fetch it? Server returns 'status'
                maxParticipantes: 0,
                status: ur.raffle.status === 'active' ? 'ativo' : 'encerrado',
                categoria: "geral",
                raridade: "comum"
            }
        }));
    },

    // Admin
    verifyAdmin: async (password: string) => {
        const res = await fetch(`${API_URL}/admin/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        if (!res.ok) throw new Error("Senha incorreta");
        return res.json();
    },

    createRaffle: async (password: string, raffle: any) => {
        const res = await fetch(`${API_URL}/raffles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, raffle }),
        });
        if (!res.ok) throw new Error("Falha ao criar sorteio");
        return res.json();
    },

    updateRaffle: async (password: string, id: string, raffle: any) => {
        const res = await fetch(`${API_URL}/raffles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, raffle }),
        });
        if (!res.ok) throw new Error("Falha ao atualizar sorteio");
        return res.json();
    },

    deleteRaffle: async (password: string, id: string) => {
        const res = await fetch(`${API_URL}/raffles/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        if (!res.ok) throw new Error("Falha ao deletar sorteio");
        return res.json();
    },

    getAdminRaffles: async () => {
        const res = await fetch(`${API_URL}/admin/raffles`);
        if (!res.ok) throw new Error("Falha ao buscar sorteios");
        const data = await res.json();
        // Map fields
        return data.map((r: any) => ({
            id: String(r.id),
            titulo: r.title,
            descricao: r.description,
            premio: r.prize_pool,
            premioValor: r.prize_value || 0,
            imagem: r.image_url,
            dataFim: r.draw_date,
            participantes: parseInt(r.tickets_sold) || 0,
            maxParticipantes: r.max_tickets,
            custoNFT: r.ticket_price,
            status: r.status === 'active' ? 'ativo' : 'encerrado',
            categoria: r.category || 'tech',
            raridade: r.rarity || 'comum',
            winner: r.winner_name ? {
                id: r.winner_id,
                name: r.winner_name,
                picture: r.winner_picture
            } : undefined
        }));
    },

    // Notifications
    getNotifications: async (userId: number) => {
        const res = await fetch(`${API_URL}/notifications?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        return res.json();
    },

    markNotificationRead: async (id: number) => {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: "PUT",
        });
        if (!res.ok) throw new Error("Failed to mark notification read");
        return res.json();
    },

    drawRaffle: async (password: string, id: string) => {
        const res = await fetch(`${API_URL}/raffles/${id}/draw`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        if (!res.ok) throw new Error("Falha ao realizar sorteio");
        return res.json();
    },
};
