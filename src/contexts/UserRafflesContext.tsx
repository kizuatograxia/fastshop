import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Raffle } from "@/types/raffle";

interface UserRaffle {
    raffle: Raffle;
    ticketsComprados: number;
    totalValueContributed: number;
    dataParticipacao: string;
}

interface UserRafflesContextType {
    userRaffles: UserRaffle[];
    addUserRaffle: (raffle: Raffle, tickets: number, value: number) => void;
    removeUserRaffle: (raffleId: string) => void;
    isParticipating: (raffleId: string) => boolean;
    getTicketCount: (raffleId: string) => number;
    getUserValue: (raffleId: string) => number;
}

const UserRafflesContext = createContext<UserRafflesContextType | undefined>(undefined);

export const UserRafflesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userRaffles, setUserRaffles] = useState<UserRaffle[]>(() => {
        const saved = localStorage.getItem("fastshop_user_raffles");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("fastshop_user_raffles", JSON.stringify(userRaffles));
    }, [userRaffles]);

    const addUserRaffle = useCallback((raffle: Raffle, tickets: number, value: number) => {
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
    }, []);

    const removeUserRaffle = useCallback((raffleId: string) => {
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

    return (
        <UserRafflesContext.Provider
            value={{
                userRaffles,
                addUserRaffle,
                removeUserRaffle,
                isParticipating,
                getTicketCount,
                getUserValue,
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
