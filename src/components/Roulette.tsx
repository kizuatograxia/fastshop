import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { Trophy, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Candidate {
    id: number;
    name: string;
    picture: string;
    ticket_count: number;
    color?: string;
}

interface RouletteProps {
    candidates: Candidate[];
    winnerId?: number | null;
    onSpinStart: () => void;
    onFinished: () => void;
    onClose: () => void;
}

const COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB",
    "#E67E22", "#2ECC71", "#1ABC9C", "#F1C40F", "#E74C3C", "#34495E", "#95A5A6"
];

const Roulette: React.FC<RouletteProps> = ({ candidates, winnerId, onSpinStart, onFinished, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showWinner, setShowWinner] = useState(false);

    // Filter valid candidates and assign colors
    const participants = React.useMemo(() => {
        return candidates.filter(c => c.ticket_count > 0).map((c, i) => ({
            ...c,
            color: COLORS[i % COLORS.length]
        }));
    }, [candidates]);

    const totalTickets = participants.reduce((acc, curr) => acc + curr.ticket_count, 0);

    // Draw Wheel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let currentAngle = 0;

        participants.forEach(p => {
            const sliceAngle = (p.ticket_count / totalTickets) * 2 * Math.PI;

            // Draw Part
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = p.color!;
            ctx.fill();
            ctx.stroke();

            // Text (Name)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(currentAngle + sliceAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px sans-serif";
            if (sliceAngle > 0.1) { // Only draw text if slice is big enough
                ctx.fillText(p.name.split(' ')[0], radius - 30, 5);
            }
            ctx.restore();

            currentAngle += sliceAngle;
        });

        // Draw Center Point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0,0,0,0.2)";

        ctx.beginPath();
        ctx.moveTo(centerX + 40, centerY);
        ctx.lineTo(centerX + 60, centerY - 10);
        ctx.lineTo(centerX + 60, centerY + 10);
        ctx.fillStyle = "black";
        ctx.fill();

    }, [participants, totalTickets]);

    // Handle Spin
    useEffect(() => {
        if (winnerId && !isSpinning && !showWinner) {
            spinToWinner(winnerId);
        }
    }, [winnerId]);

    const spinToWinner = (winId: number) => {
        setIsSpinning(true);

        // Find winner slice angles
        let startAngle = 0;
        let endAngle = 0;

        for (const p of participants) {
            const slice = (p.ticket_count / totalTickets) * 360;
            if (p.id === winId) {
                endAngle = startAngle + slice;
                break;
            }
            startAngle += slice;
        }

        // Random landing spot within winner slice (with padding)
        const randomOffset = Math.random() * (endAngle - startAngle) * 0.8 + (startAngle + (endAngle - startAngle) * 0.1);

        // Calculate rotations
        // We want to rotate BACKWARDS or adjust coordinate system so that the target angle lands at 0 degrees (Right side usually)
        // Canvas 0 is Right (3 o'clock).
        // Let's assume we want to land at 0 (Right pointer).
        // If target is at 90deg, we need to rotate -90deg to bring it to 0.
        // Add multiple full spins (5 * 360).

        const targetRotation = (360 * 5) + (360 - randomOffset);

        setRotation(targetRotation);

        // Wait for CSS transition
        setTimeout(() => {
            setZoomLevel(1.5); // Zoom IN
            setTimeout(() => {
                setShowWinner(true);
                onFinished();
            }, 1000);
        }, 5000 + 500); // 5s spin payload
    };

    const winner = participants.find(p => p.id === winnerId);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center justify-center">
                {/* Close (Only if showing winner or error) */}
                {showWinner && (
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 rounded-full p-2 hover:bg-white/20">
                        <X className="text-white w-6 h-6" />
                    </button>
                )}

                {!winnerId && (
                    <div className="absolute top-[-100px] text-white text-2xl font-bold animate-pulse">
                        Aguardando confirmação do sorteio...
                    </div>
                )}

                {/* Wheel Container */}
                <div
                    className="relative transition-transform duration-1000 ease-in-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                >
                    {/* Arrow Pointer (Fixed on the right side pointing left) */}
                    <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[15px] border-t-transparent border-r-[30px] border-r-white border-b-[15px] border-b-transparent z-10 drop-shadow-lg" />

                    <div
                        className="rounded-full shadow-2xl border-4 border-white/20 overflow-hidden"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
                        }}
                    >
                        <canvas ref={canvasRef} width={500} height={500} />
                    </div>
                </div>

                {/* Winner Reveal Modal */}
                {showWinner && winner && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="bg-card p-8 rounded-3xl shadow-2xl border border-primary/20 flex flex-col items-center gap-4 animate-in zoom-in-50 duration-500 scale-150">
                            <div className="relative">
                                <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
                                <div className="absolute -top-2 -right-2 text-4xl">🎉</div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Vencedor</h3>
                                <div className="flex flex-col items-center gap-2">
                                    <Avatar className="w-20 h-20 ring-4 ring-primary ring-offset-2">
                                        <AvatarImage src={winner.picture} />
                                        <AvatarFallback className="text-2xl font-bold">{winner.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                                        {winner.name}
                                    </h2>
                                </div>
                                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-mono font-bold mt-2">
                                    Ticket #{winner.ticket_count}
                                </div>
                            </div>
                            <Button size="lg" className="w-full mt-4" onClick={onClose}>
                                Fechar Sorteio
                            </Button>
                        </div>
                    </div>
                )}

                {/* Spin Button if not started */}
                {!winnerId && !isSpinning && (
                    <Button
                        size="lg"
                        className="mt-8 text-xl px-12 py-8 rounded-full shadow-xl shadow-primary/20 font-black animate-pulse"
                        onClick={onSpinStart}
                    >
                        GIRAR ROLETA 🎲
                    </Button>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Roulette;
