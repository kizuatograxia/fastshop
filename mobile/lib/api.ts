import { storage } from "./storage";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.131.254.179:5050/api";
if (__DEV__) {
    console.log("API URL configured as:", API_URL);
}

/**
 * Centralized request wrapper to handle headers, authentication, and errors.
 */
async function request(path: string, options: RequestInit = {}) {
    const token = storage.getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Erro desconhecido na API" }));
        throw new Error(errorData.message || errorData.error || `Erro ${res.status}`);
    }

    return res.json();
}

export const api = {
    login: async (email: string, password: string) => {
        const data = await request("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        // Mock name for standard login if backend doesn't return it
        if (data.user && !data.user.name) {
            data.user.name = email.split('@')[0]; // Use part of email as name
            data.user.picture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username || email}`;
        }

        return data;
    },

    googleLogin: async (credential: string) => {
        return request("/auth/google", {
            method: "POST",
            body: JSON.stringify({ token: credential }),
        });
    },

    register: async (email: string, password: string) => {
        return request("/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },

    updateProfile: async (userId: string | number, profileData: any) => {
        return request(`/users/${userId}/profile`, {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    },

    forgotPassword: async (email: string) => {
        return request("/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: async (token: string, password: string) => {
        return request("/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, password }),
        });
    },

    getWallet: async (userId: number | string) => {
        return request(`/wallet?userId=${userId}`);
    },

    addToWallet: async (userId: number | string, nft: any) => {
        return request("/wallet", {
            method: "POST",
            body: JSON.stringify({ userId, nft }),
        });
    },

    removeFromWallet: async (userId: number | string, nftId: string, quantity: number = 1) => {
        return request("/wallet/remove", {
            method: "POST",
            body: JSON.stringify({ userId, nftId, quantity }),
        });
    },

    // Marketplace — NFT catalog is static, served locally (no /nfts endpoint in backend)
    getNFTCatalog: async () => {
        const IMAGE_BASE_URL = "https://mundopix.com";
        return [
            { id: "nft-1", nome: "Beija-flor", emoji: "🐦", image: `${IMAGE_BASE_URL}/beijaflor-emoji.png`, preco: 1.00, raridade: "comum", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-2", nome: "Tartaruga", emoji: "🐢", image: `${IMAGE_BASE_URL}/tartaruga-emoji.png`, preco: 2.00, raridade: "comum", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-3", nome: "Garça", emoji: "🦢", image: `${IMAGE_BASE_URL}/garca-emoji.png`, preco: 5.00, raridade: "comum", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-4", nome: "Arara", emoji: "🦜", image: `${IMAGE_BASE_URL}/arara-emoji.png`, preco: 10.00, raridade: "raro", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-5", nome: "Mico-Leão", emoji: "🐒", image: `${IMAGE_BASE_URL}/mico-emoji.png`, preco: 20.00, raridade: "raro", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-6", nome: "Onça-Pintada", emoji: "🐆", image: `${IMAGE_BASE_URL}/onca-emoji.png`, preco: 50.00, raridade: "epico", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-7", nome: "Garoupa", emoji: "🐟", image: `${IMAGE_BASE_URL}/garoupa-emoji.png`, preco: 100.00, raridade: "epico", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-8", nome: "Lobo-Guará", emoji: "🐺", image: `${IMAGE_BASE_URL}/lobo-emoji.png`, preco: 200.00, raridade: "lendario", descricao: "NFT que garante até 10 cotas." },
            { id: "nft-9", nome: "Boto-Cor-de-Rosa", emoji: "🐬", image: `${IMAGE_BASE_URL}/boto-emoji.png`, preco: 500.00, raridade: "lendario", descricao: "Lenda dos rios amazônicos." },
            { id: "nft-10", nome: "Jacaré-Açu", emoji: "🐊", image: `${IMAGE_BASE_URL}/jacare-emoji.png`, preco: 1000.00, raridade: "mitico", descricao: "O maior predador da Amazônia." },
            { id: "nft-11", nome: "Tucano", emoji: "🦤", image: `${IMAGE_BASE_URL}/tucano-emoji.png`, preco: 1500.00, raridade: "mitico", descricao: "Símbolo das florestas tropicais." },
            { id: "nft-12", nome: "Ararinha-Azul", emoji: "🪶", image: `${IMAGE_BASE_URL}/ararinha-emoji.png`, preco: 2000.00, raridade: "celestial", descricao: "A joia mais rara dos céus do Brasil." },
        ];
    },

    // Raffles
    getActiveRaffles: async () => {
        const data = await request("/raffles");

        // Map backend fields to frontend interface
        return data
            .filter((r: any) => r.status === 'active')
            .map((r: any) => ({
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
                winnersAmount: r.winners_amount || 1
            }));
    },

    getCategories: async () => {
        return request("/categories");
    },

    getRaffle: async (id: string) => {
        const r = await request(`/raffles/${id}`);
        // Map raw backend fields -> same shape as getActiveRaffles
        return {
            id: String(r.id),
            titulo: r.title ?? r.titulo,
            descricao: r.description ?? r.descricao,
            premio: r.prize_pool ?? r.premio ?? r.title,
            premioValor: r.prize_value ?? 0,
            imagem: r.image_url ?? r.imagem,
            image_urls: r.image_urls,
            dataFim: r.draw_date ?? r.dataFim ?? null,
            participantes: parseInt(r.tickets_sold) || r.participantes || 0,
            maxParticipantes: r.max_tickets ?? r.maxParticipantes ?? 100,
            custoNFT: r.ticket_price ?? r.custoNFT ?? 0,
            status: (r.status === 'active' || r.status === 'ativo') ? 'ativo' : 'encerrado',
            categoria: r.category ?? r.categoria ?? 'geral',
            raridade: r.rarity ?? r.raridade ?? 'comum',
            winnersAmount: r.winners_amount ?? 1,
        };
    },

    getRaffleParticipants: async (id: string) => {
        return request(`/raffles/${id}/participants`);
    },

    joinRaffle: async (raffleId: number | string, userId: number | string, nfts: Record<string, number>, ticketCount?: number, txHash?: string) => {
        return request(`/raffles/${raffleId}/join`, {
            method: "POST",
            body: JSON.stringify({ userId, nfts, ticketCount, txHash }),
        });
    },

    buyNFTs: async (userId: number | string, items: { id: string; quantity: number }[], couponCode?: string) => {
        return request("/shop/buy", {
            method: "POST",
            body: JSON.stringify({ userId, items, couponCode }),
        });
    },

    createPayment: async (userId: number | string, amount: number, realItems: any[]) => {
        return request("/payment/create", {
            method: "POST",
            body: JSON.stringify({ userId, amount, realItems }),
        });
    },

    validateCoupon: async (code: string, cartTotal: number) => {
        return request("/coupons/validate", {
            method: "POST",
            body: JSON.stringify({ code, cartTotal }),
        });
    },

    getUserRaffles: async (userId: number | string) => {
        const data = await request(`/user/raffles?userId=${userId}`);

        // Ensure IDs are strings to match frontend types
        return data.map((ur: any) => ({
            ...ur,
            ticketsComprados: ur.ticketsComprados ?? ur.ticket_count ?? ur.tickets_purchased ?? ur.tickets ?? 0,
            totalValueContributed: ur.totalValueContributed ?? ur.total_value ?? ur.amount ?? ur.value_contributed ?? 0,
            raffle: {
                id: String(ur.raffle.id),
                titulo: ur.raffle.title,
                descricao: ur.raffle.description,
                imagem: ur.raffle.image,
                premio: ur.raffle.prize,
                premioValor: ur.raffle.prizeValue || 0,
                dataFim: ur.raffle.drawDate,
                custoNFT: ur.raffle.price,
                participantes: 0,
                maxParticipantes: 0,
                status: ur.raffle.status === 'active' ? 'ativo' : 'encerrado',
                categoria: "geral",
                raridade: "comum",
                winnersAmount: ur.raffle.winners_amount || 1,
                winner_id: ur.raffle.winner_id,
                winner: ur.raffle.winner ? {
                    id: ur.raffle.winner.id,
                    name: ur.raffle.winner.name,
                    picture: ur.raffle.winner.picture
                } : undefined,
                trackingCode: ur.raffle.tracking_code,
                carrier: ur.raffle.carrier,
                shippingStatus: ur.raffle.shipping_status,
                shippedAt: ur.raffle.shipped_at
            }
        }));
    },

    // Admin
    verifyAdmin: async (password: string) => {
        return request("/admin/verify", {
            method: "POST",
            body: JSON.stringify({ password }),
        });
    },

    createRaffle: async (password: string, raffle: any) => {
        return request("/raffles", {
            method: "POST",
            body: JSON.stringify({ password, raffle }),
        });
    },

    // Admin Coupons
    getCoupons: async () => {
        return request("/admin/coupons");
    },

    createCoupon: async (coupon: any) => {
        return request("/admin/coupons", {
            method: "POST",
            body: JSON.stringify(coupon),
        });
    },

    deleteCoupon: async (id: number | string) => {
        return request(`/admin/coupons/${id}`, {
            method: "DELETE",
        });
    },

    // Admin Users & Chat
    getAdminUserDetails: async (userId: number | string) => {
        return request(`/admin/users/${userId}`);
    },

    getMessages: async (userId: number | string) => {
        return request(`/chat/${userId}`);
    },

    sendMessage: async (senderId: number, receiverId: number, content: string) => {
        return request("/chat/send", {
            method: "POST",
            body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, content }),
        });
    },

    calculateShipping: async (cep: string, items: any[]) => {
        return request("/shipping/calculate", {
            method: "POST",
            body: JSON.stringify({ cep, items }),
        });
    },

    updateTracking: async (raffleId: string, trackingData: { trackingCode: string, carrier: string, status?: string }) => {
        const password = storage.getAdminKey();
        return request(`/admin/raffles/${raffleId}/tracking`, {
            method: "PUT",
            body: JSON.stringify({ ...trackingData, password }),
        });
    },

    updateRaffle: async (password: string, id: string, raffle: any) => {
        return request(`/raffles/${id}`, {
            method: "PUT",
            body: JSON.stringify({ password, raffle }),
        });
    },

    deleteRaffle: async (password: string, id: string) => {
        return request(`/raffles/${id}`, {
            method: "DELETE",
            body: JSON.stringify({ password }),
        });
    },

    getAdminRaffles: async () => {
        const data = await request("/admin/raffles");
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
            winnersAmount: r.winners_amount || 1,
            winner: r.winner_name ? {
                id: r.winner_id,
                name: r.winner_name,
                picture: r.winner_picture,
                email: r.winner_email,
                address: r.winner_address,
                city: r.winner_city,
                state: r.winner_state,
                cep: r.winner_cep
            } : undefined,
            recipient_name: r.recipient_name,
            recipient_cpf: r.recipient_cpf,
            recipient_email: r.recipient_email,

            // Shipping
            trackingCode: r.tracking_code,
            carrier: r.carrier,
            shippingStatus: r.shipping_status,
            shippedAt: r.shipped_at
        }));
    },

    // Notifications
    getWinners: async () => {
        return request("/winners");
    },

    getNotifications: async (userId: number | string) => {
        return request(`/notifications?userId=${userId}`);
    },

    markNotificationRead: async (id: number) => {
        return request(`/notifications/${id}/read`, {
            method: "PUT",
        });
    },

    drawRaffle: async (password: string, id: string) => {
        return request(`/raffles/${id}/draw`, {
            method: "POST",
            body: JSON.stringify({ password }),
        });
    },

    // Gate Verification (Mock)
    verifyGate: async (cpf: string, birthDate: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Here you would validate against a blacklist or database
        // For now, we trust the client-side validation which handles format/age

        return { success: true };
    },

    // ------------------------------------------------------------------
    // RESTORED / ADDED: Testimonials / Reviews (LocalStorage Implementation)
    // ------------------------------------------------------------------

    // Public submission
    submitTestimonial: async (testimonial: any) => {
        try {
            return await request("/winners", {
                method: "POST",
                body: JSON.stringify(testimonial),
            });
        } catch (e) {
            console.warn("API submission failed, falling back to local storage", e);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const storedReviews = storage.getReviews();
            const newReview = {
                ...testimonial,
                id: String(Date.now()),
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
            storage.setReviews([...storedReviews, newReview]);
            return { success: true, local: true };
        }
    },

    // Admin: Get Pending (Hybrid: Local + API if available)
    getPendingReviews: async (password: string) => {
        try {
            return await request("/winners?status=pending");
        } catch (e) {
            console.warn("Failed to fetch pending reviews, falling back to local", e);
        }

        const storedReviews = storage.getReviews();
        return storedReviews.filter((r: any) => r.status === 'pending');
    },

    // Public: Get Approved (for landing page)
    getApprovedReviews: async () => {
        try {
            return await request("/winners");
        } catch (e) {
            console.warn("Failed to fetch global winners, falling back to local", e);
        }

        const storedReviews = storage.getReviews();
        return storedReviews.filter((r: any) => r.status === 'approved');
    },

    approveReview: async (password: string, id: string) => {
        try {
            return await request(`/winners/${id}/approve`, {
                method: "PUT",
                body: JSON.stringify({ password }),
            });
        } catch (e) {
            console.error("API approve failed", e);
        }

        // Fallback local update
        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = storage.getReviews();
        const updatedReviews = storedReviews.map((r: any) =>
            r.id === id ? { ...r, status: 'approved' } : r
        );
        storage.setReviews(updatedReviews);
        return { success: true };
    },

    rejectReview: async (password: string, id: string) => {
        try {
            return await request(`/winners/${id}/reject`, {
                method: "PUT",
                body: JSON.stringify({ password }),
            });
        } catch (e) {
            console.error("API reject failed", e);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = storage.getReviews();
        const updatedReviews = storedReviews.filter((r: any) => r.id !== id);
        storage.setReviews(updatedReviews);
        return { success: true };
    },

    deleteReview: async (password: string, id: string) => {
        try {
            return await request(`/winners/${id}`, {
                method: "DELETE",
                body: JSON.stringify({ password }),
            });
        } catch (e) {
            console.error("API delete failed", e);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        const storedReviews = storage.getReviews();
        const updatedReviews = storedReviews.filter((r: any) => r.id !== id);
        storage.setReviews(updatedReviews);
        return { success: true };
    },
};
