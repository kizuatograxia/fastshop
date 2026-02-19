import React, { useState } from "react";
import { Package, Truck, Route, CheckCircle2, Copy, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface DeliveryProgressProps {
    status: "preparing" | "shipped" | "in_transit" | "delivered";
    trackingCode?: string;
    carrier?: string;
    shippedAt?: string;
}
const steps = [
    { key: "preparing", label: "Preparando", emoji: "📦", icon: Package },
    { key: "shipped", label: "Enviado", emoji: "🚚", icon: Truck },
    { key: "in_transit", label: "Em Trânsito", emoji: "🛣️", icon: Route },
    { key: "delivered", label: "Entregue", emoji: "✅", icon: CheckCircle2 },
] as const;
const statusIndex: Record<DeliveryProgressProps["status"], number> = {
    preparing: 0,
    shipped: 1,
    in_transit: 2,
    delivered: 3,
};
const carrierUrls: Record<string, string> = {
    correios: "https://www.linkcorreios.com.br/",
    jadlog: "https://www.jadlog.com.br/tracking/",
    sedex: "https://www.linkcorreios.com.br/",
};
const DeliveryProgress: React.FC<DeliveryProgressProps> = ({
    status,
    trackingCode,
    carrier,
    shippedAt,
}) => {
    const [copied, setCopied] = useState(false);
    const currentIdx = statusIndex[status];
    const handleCopy = () => {
        if (!trackingCode) return;
        navigator.clipboard.writeText(trackingCode);
        setCopied(true);
        toast.success("Código copiado!");
        setTimeout(() => setCopied(false), 2000);
    };
    const trackingUrl = carrier
        ? (carrierUrls[carrier.toLowerCase()] || `https://www.google.com/search?q=${carrier}+rastreio+`) + (trackingCode || "")
        : trackingCode
            ? `https://www.linkcorreios.com.br/${trackingCode}`
            : "#";
    return (
        <div className="w-full rounded-xl bg-card border border-white/5 backdrop-blur-sm shadow-xl p-6 animate-fade-in">
            {/* Timeline */}
            <div className="flex items-center justify-between w-full mb-8">
                {steps.map((step, i) => {
                    const isCompleted = i < currentIdx;
                    const isCurrent = i === currentIdx;
                    const isFuture = i > currentIdx;
                    const Icon = step.icon;
                    return (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-2 z-10 min-w-[70px]">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                        isCompleted && "bg-primary/20 text-primary",
                                        isCurrent && "bg-primary/20 text-primary ring-2 ring-primary animate-pulse",
                                        isFuture && "bg-secondary text-muted-foreground"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span
                                    className={cn(
                                        "text-xs text-center transition-colors duration-300",
                                        isCompleted && "text-primary",
                                        isCurrent && "font-bold text-foreground",
                                        isFuture && "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-1 -mt-6 transition-colors duration-500 relative">
                                    <div className="absolute inset-0 bg-white/10 rounded-full" />
                                    <div
                                        className={cn(
                                            "absolute inset-0 h-full rounded-full transition-all duration-500 origin-left",
                                            i < currentIdx ? "bg-primary w-full" : "w-0"
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            {/* Tracking Info */}
            {(trackingCode || carrier || shippedAt) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        {carrier && (
                            <span className="text-xs text-muted-foreground">
                                Transportadora:{" "}
                                <span className="text-foreground font-medium capitalize">{carrier}</span>
                            </span>
                        )}
                        {trackingCode && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Código:</span>
                                <code className="font-mono text-sm bg-black/30 px-2 py-1 rounded text-foreground tracking-wider border border-white/5">
                                    {trackingCode}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 ml-1"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        )}
                        {shippedAt && (
                            <span className="text-xs text-muted-foreground mt-1 block">
                                Enviado em:{" "}
                                <span className="text-foreground">
                                    {new Date(shippedAt).toLocaleDateString("pt-BR")}
                                </span>
                            </span>
                        )}
                    </div>
                    {trackingCode && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 w-full sm:w-auto mt-2 sm:mt-0"
                            asChild
                        >
                            <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                                Rastrear <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
export default DeliveryProgress;
