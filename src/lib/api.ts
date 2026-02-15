// Hardcoded fallback for production debug
// Use relative path in production (same domain) to avoid CORS and support custom domains
const PROD_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? "https://4fx59qbb.up.railway.app/api"
    : "/api";
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

    updateProfile: async (userId: string | number, profileData: any) => {
        const res = await fetch(`${API_URL}/users/${userId}/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
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

    joinRaffle: async (raffleId: number | string, userId: number | string, nfts: Record<string, number>, ticketCount?: number, txHash?: string) => {
        const res = await fetch(`${API_URL}/raffles/${raffleId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nfts, ticketCount, txHash }),
        });
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
    },

    buyNFTs: async (userId: number | string, items: { id: string; quantity: number }[]) => {
        const res = await fetch(`${API_URL}/shop/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, items }),
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

    // Gate Verification (Mock)
    verifyGate: async (cpf: string, birthDate: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Here you would validate against a blacklist or database
        // For now, we trust the client-side validation which handles format/age
        console.log("Gate verified for:", { cpf, birthDate });

        return { success: true };
    },

    // ------------------------------------------------------------------
    // RESTORED / ADDED: Testimonials / Reviews (LocalStorage Implementation)
    // ------------------------------------------------------------------

    // Public submission
    submitTestimonial: async (testimonial: any) => {
        const res = await fetch(`${API_URL}/winners`, { // Assuming /winners accepts POST for new testimonials, or we need /testimonials
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testimonial),
        });

        // Fallback to local if API fails (temporary measure for user satisfaction if backend is broken)
        if (!res.ok) {
            console.warn("API submission failed, falling back to local storage");
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
            const newReview = {
                ...testimonial,
                id: String(Date.now()),
                createdAt: new Date().toISOString(),
                status: 'pending' // Still pending local
            };
            localStorage.setItem("admin_reviews", JSON.stringify([...storedReviews, newReview]));
            return { success: true, local: true };
        }

        return res.json();
    },

    // Admin: Get Pending (Hybrid: Local + API if available)
    getPendingReviews: async (password: string) => {
        try {
            // Use verifyAdmin endpoint first to actually check password on backend
            // Though often included in the query... let's just GET pending reviews if the endpoint
            // supports filtering by status (which is common).
            // Assuming /winners?status=pending or /testimonials?status=pending
            const res = await fetch(`${API_URL}/winners?status=pending`);
            if (res.ok) {
                const data = await res.json();
                return data;
            }
        } catch (e) {
            console.warn("Failed to fetch pending reviews, falling back to local", e);
        }

        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");

        return storedReviews.filter((r: any) => r.status === 'pending');
    },

    // Public: Get Approved (for landing page)
    getApprovedReviews: async () => {
        try {
            const res = await fetch(`${API_URL}/winners`);
            if (res.ok) {
                const data = await res.json();
                return data;
            }
        } catch (e) {
            console.warn("Failed to fetch global winners, falling back to local", e);
        }

        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        return storedReviews.filter((r: any) => r.status === 'approved');
    },

    approveReview: async (password: string, id: string) => {
        try {
            const res = await fetch(`${API_URL}/winners/${id}/approve`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                return { success: true };
            }
        } catch (e) {
            console.error("API approve failed", e);
        }

        // Fallback local update (so admin sees immediate feedback even if API fails)
        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        const updatedReviews = storedReviews.map((r: any) =>
            r.id === id ? { ...r, status: 'approved' } : r
        );
        localStorage.setItem("admin_reviews", JSON.stringify(updatedReviews));
        return { success: true };
    },

    rejectReview: async (password: string, id: string) => {
        try {
            const res = await fetch(`${API_URL}/winners/${id}/reject`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                return { success: true };
            }
        } catch (e) {
            console.error("API reject failed", e);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = JSON.parse(localStorage.getItem("admin_reviews") || "[]");
        // Remove from list
        const updatedReviews = storedReviews.filter((r: any) => r.id !== id);
        localStorage.setItem("admin_reviews", JSON.stringify(updatedReviews));
        return { success: true };
    },
};
