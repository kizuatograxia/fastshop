import { AnimatePresence, motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRequestQueue } from "@/hooks/useRequestQueue";
import { cn } from "@/lib/utils";

/**
 * QueueStatus — floating toast shown while queue has items.
 * Attach once in MainLayout; it auto-hides when queue is empty.
 */
export const QueueStatus: React.FC = () => {
    const { items, isProcessing, currentItem, pendingCount } = useRequestQueue();

    const visible = items.length > 0;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
                >
                    <div className="queue-status-card">
                        {/* Icon */}
                        <span className="queue-status-icon">
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                        </span>

                        {/* Text */}
                        <div className="queue-status-text">
                            {currentItem ? (
                                <>
                                    <p className="queue-status-label">{currentItem.label}</p>
                                    {currentItem.attempt > 1 && (
                                        <p className="queue-status-sub">
                                            Tentativa {currentItem.attempt}/{currentItem.maxAttempts}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="queue-status-label">Aguardando...</p>
                            )}

                            {pendingCount > 0 && (
                                <p className="queue-status-sub">
                                    +{pendingCount} na fila
                                </p>
                            )}
                        </div>

                        {/* Status dots */}
                        <div className="queue-status-dots">
                            {items.slice(0, 4).map((item) => (
                                <span
                                    key={item.id}
                                    className={cn("queue-dot", {
                                        "queue-dot-processing": item.status === "processing",
                                        "queue-dot-pending": item.status === "pending",
                                        "queue-dot-done": item.status === "done",
                                        "queue-dot-failed": item.status === "failed",
                                    })}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * Inline result badge to show after enqueue resolves.
 */
export const QueueResultBadge: React.FC<{
    status: "success" | "error" | "idle";
    message?: string;
}> = ({ status, message }) => {
    if (status === "idle") return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                    "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg",
                    status === "success"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                )}
            >
                {status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message}</span>
            </motion.div>
        </AnimatePresence>
    );
};
