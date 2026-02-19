import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Raffle } from "@/types/raffle";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UserRaffle {
    raffle: Raffle;
    ticketsComprados: number;
    totalValueContributed: number;
    dataParticipacao: string;
}

interface UserRafflesContextType {
    userRaffles: UserRaffle[];
    addUserRaffle: (raffle: Raffle, tickets: number, value: number, nfts: Record<string, number>) => Promise<void>;
    removeUserRaffle: (raffleId: string) => void;
    isParticipating: (raffleId: string) => boolean;
    getTicketCount: (raffleId: string) => number;
    getUserValue: (raffleId: string) => number;
    getWonRaffles: () => UserRaffle[];
}

const UserRafflesContext = createContext<UserRafflesContextType | undefined>(undefined);

export const UserRafflesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userRaffles, setUserRaffles] = useState<UserRaffle[]>([]);

    const fetchUserRaffles = useCallback(async () => {
        if (!user) {
            setUserRaffles([]);
            return;
        }
        try {
            const uid = parseInt(user.id);
            if (!isNaN(uid)) {
                const data = await api.getUserRaffles(uid);
                setUserRaffles(data);
            }
        } catch (error) {
            console.error("Failed to load user raffles", error);
        }
    }, [user]);

    useEffect(() => {
        fetchUserRaffles();
    }, [fetchUserRaffles]);

    const addUserRaffle = useCallback(async (raffle: Raffle, tickets: number, value: number, nfts: Record<string, number>) => {
        if (!user) return;
        try {
            // Optimistic update
            setUserRaffles((current) => {
                const existing = current.find((ur) => ur.raffle.id === raffle.id);
                if (existing) {
                    return current.map((ur) =>
                        ur.raffle.id === raffle.id
                            ? {
                                ...ur,
                                ticketsComprados: ur.ticketsComprados + tickets,
                                totalValueContributed: (ur.totalValueContributed || 0) + value
                            }
                            : ur
                    );
                }
                return [
                    ...current,
                    {
                        raffle,
                        ticketsComprados: tickets,
                        totalValueContributed: value,
                        dataParticipacao: new Date().toISOString(),
                    },
                ];
            });

            // Validate IDs
            const rId = parseInt(raffle.id);
            const uId = parseInt(user.id);

            if (isNaN(rId)) throw new Error("ID do sorteio inválido");
            if (isNaN(uId)) throw new Error("ID do usuário inválido");

            // Call API with NFTs
            await api.joinRaffle(rId, uId, nfts, tickets);

            // Refresh to ensure sync with backend
            await fetchUserRaffles();

            toast.success("Participação registrada com sucesso!");

        } catch (error: any) {
            console.error("Failed to join raffle", error);
            // Revert optimistic update
            fetchUserRaffles();
            toast.error(error.message || "Erro ao registrar participação");
            throw error; // Re-throw to handle in UI
        }
    }, [user, fetchUserRaffles]);

    const removeUserRaffle = useCallback((raffleId: string) => {
        // Not implemented in API yet for user removal of participation, assuming permanent for now
        setUserRaffles((current) => current.filter((ur) => ur.raffle.id !== raffleId));
    }, []);

    const isParticipating = useCallback((raffleId: string) => {
        return userRaffles.some((ur) => ur.raffle.id === raffleId);
    }, [userRaffles]);

    const getTicketCount = useCallback((raffleId: string) => {
        const ur = userRaffles.find((ur) => ur.raffle.id === raffleId);
        return ur?.ticketsComprados ?? 0;
    }, [userRaffles]);

    const getUserValue = useCallback((raffleId: string) => {
        const ur = userRaffles.find((ur) => ur.raffle.id === raffleId);
        return ur?.totalValueContributed ?? 0;
    }, [userRaffles]);

    const getWonRaffles = useCallback(() => {
        if (!user) return [];
        return userRaffles.filter(ur =>
            // Check if raffle has a winner and that winner ID matches current user ID
            // We need to handle type mismatch (string vs number) robustly
            ur.raffle.winner_id && String(ur.raffle.winner_id) === String(user.id)
        );
    }, [userRaffles, user]);

    return (
        <UserRafflesContext.Provider
            value={{
                userRaffles,
                addUserRaffle,
                removeUserRaffle,
                isParticipating,
                getTicketCount,
                getUserValue,
                getWonRaffles,
            }}
        >
            {children}
        </UserRafflesContext.Provider>
    );
};

export const useUserRaffles = () => {
    const context = useContext(UserRafflesContext);
    if (!context) {
        throw new Error("useUserRaffles must be used within a UserRafflesProvider");
    }
    return context;
};
