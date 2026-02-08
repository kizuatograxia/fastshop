import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, ChevronDown, X } from "lucide-react";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { useAuth } from "@/contexts/AuthContext";
import { CountdownBadge } from "@/components/CountdownBadge";
import { Link } from "react-router-dom";

export const RaffleParticipationWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { userRaffles } = useUserRaffles();

    // Filter only active raffles
    const activeRaffles = userRaffles.filter(ur => {
        const status = ur.raffle.status;
        return status === 'ativo' || status === 'active';
    });

    // Don't render if user is not logged in or has no active raffles
    if (!user || activeRaffles.length === 0) return null;

    // Check if any raffle is ending soon (within 1 hour)
    const hasUrgent = activeRaffles.some(ur => {
        const endTime = new Date(ur.raffle.dataFim).getTime();
        const now = Date.now();
        return endTime - now < 3600000 && endTime > now;
    });

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start">
            {/* Expanded List */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-3 w-80 max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl shadow-primary/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-purple-600">
                                    <Ticket className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-foreground">
                                    Participando de {activeRaffles.length}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Raffle List */}
                        <div className="max-h-80 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                            {activeRaffles.map((ur) => (
                                <Link
                                    key={ur.raffle.id}
                                    to={`/raffle/${ur.raffle.id}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-colors cursor-pointer"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                            <img
                                                src={ur.raffle.imagem || "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100"}
                                                alt={ur.raffle.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-foreground truncate">
                                                {ur.raffle.titulo}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CountdownBadge
                                                    targetDate={ur.raffle.dataFim}
                                                    className="text-[10px] px-1.5 py-0.5"
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    • {ur.ticketsComprados} ticket{ur.ticketsComprados !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 bg-white/5">
                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                            >
                                Ver todos meus sorteios →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all
                    border border-white/10
                    ${isOpen
                        ? 'bg-background/90 text-foreground'
                        : 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-primary/30'
                    }
                    ${hasUrgent && !isOpen ? 'animate-pulse' : ''}
                `}
            >
                {isOpen ? (
                    <ChevronDown className="w-5 h-5" />
                ) : (
                    <Ticket className="w-5 h-5" />
                )}

                {/* Badge Counter */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground shadow-lg">
                        {activeRaffles.length}
                    </span>
                )}

                {/* Urgent Glow Ring */}
                {hasUrgent && !isOpen && (
                    <span className="absolute inset-0 rounded-full border-2 border-destructive/50 animate-ping" />
                )}
            </motion.button>
        </div>
    );
};
