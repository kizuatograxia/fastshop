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
        const data = await res.json();

        // Mock name for standard login if backend doesn't return it
        if (data.user && !data.user.name) {
            data.user.name = email.split('@')[0]; // Use part of email as name
            data.user.picture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username || email}`;
        }

        return data;
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

    getWallet: async (userId: number | string) => {
        const res = await fetch(`${API_URL}/wallet?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch wallet");
        return res.json();
    },

    addToWallet: async (userId: number | string, nft: any) => {
        const res = await fetch(`${API_URL}/wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nft }),
        });
        if (!res.ok) throw new Error("Failed to add to wallet");
        return res.json();
    },

    removeFromWallet: async (userId: number | string, nftId: string, quantity: number = 1) => {
        const res = await fetch(`${API_URL}/wallet/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nftId, quantity }),
        });
        if (!res.ok) throw new Error("Failed to remove from wallet");
        return res.json();
    },

    // Marketplace
    getNFTCatalog: async () => {
        const res = await fetch(`${API_URL}/nfts`);
        if (!res.ok) throw new Error("Failed to fetch NFT catalog");
        const data = await res.json();
        return data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            emoji: item.emoji,
            price: Number(item.price),
            rarity: item.rarity,
            description: item.description,
            gradient: item.gradient || "from-primary/20 to-accent/20",
            stock: item.stock
        }));
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

    joinRaffle: async (raffleId: number | string, userId: number | string, ticketCount: number, txHash?: string) => {
        const res = await fetch(`${API_URL}/raffles/${raffleId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, ticketCount, txHash }),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
    },

    getUserRaffles: async (userId: number | string) => {
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
                raridade: "comum",
                winner_id: ur.raffle.winner_id,
                winner: ur.raffle.winner ? {
                    id: ur.raffle.winner.id,
                    name: ur.raffle.winner.name,
                    picture: ur.raffle.winner.picture
                } : undefined
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
    getWinners: async () => {
        const res = await fetch(`${API_URL}/winners`);
        if (!res.ok) throw new Error("Failed to fetch winners");
        return res.json(); // Returns simple mapped objects directly suitable for feed
    },

    getNotifications: async (userId: number | string) => {
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

    // ------------------------------------------------------------------
    // RESTORED / ADDED: Testimonials / Reviews (LocalStorage Implementation)
    // ------------------------------------------------------------------

    // Public submission
    submitTestimonial: async (testimonial: any) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        const newReview = {
            ...testimonial,
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        localStorage.setItem("admin_reviews", JSON.stringify([...storedReviews, newReview]));
        console.log("Testimonial saved to localStorage:", newReview);
        return { success: true };
    },

    // Admin: Get Pending
    getPendingReviews: async (password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");

        // Initial Mock Data (only if empty to avoid empty state on first load)
        if (storedReviews.length === 0) {
            const mockReviews = [
                {
                    id: "101",
                    userId: "42",
                    userName: "Carlos Silva",
                    userAvatar: "",
                    raffleName: "iPhone 15 Pro Max",
                    prizeName: "iPhone 15 Pro Max 256GB",
                    rating: 5,
                    comment: "Incrível! Chegou em 2 dias, lacrado. Muito obrigado equipe MundoPix!",
                    photoUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=150&q=80",
                    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
                    status: 'pending'
                },
                {
                    id: "102",
                    userId: "88",
                    userName: "Ana Julia",
                    userAvatar: "",
                    raffleName: "Sorteio de R$ 5.000",
                    prizeName: "Pix de R$ 5k",
                    rating: 5,
                    comment: "Caiu na conta na hora! Salvou meu mês. Recomendo demais.",
                    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
                    status: 'pending'
                }
            ];
            // Save mock data so it persists and user sees *something*
            localStorage.setItem("admin_reviews", JSON.stringify(mockReviews));
            return mockReviews;
        }

        return storedReviews.filter((r: any) => r.status === 'pending');
    },

    // Public: Get Approved (for landing page)
    getApprovedReviews: async () => {
        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        return storedReviews.filter((r: any) => r.status === 'approved');
    },

    approveReview: async (password: string, id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        const updatedReviews = storedReviews.map((r: any) =>
            r.id === id ? { ...r, status: 'approved' } : r
        );
        localStorage.setItem("admin_reviews", JSON.stringify(updatedReviews));
        return { success: true };
    },

    rejectReview: async (password: string, id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        // Remove from list
        const updatedReviews = storedReviews.filter((r: any) => r.id !== id);
        localStorage.setItem("admin_reviews", JSON.stringify(updatedReviews));
        return { success: true };
    },
};
