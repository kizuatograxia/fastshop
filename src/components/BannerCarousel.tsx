import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    buttonText?: string;
}

const BannerCarousel: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_URL}/banners`);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setBanners(data);
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [banners.length]);

    if (loading || banners.length === 0) return null;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    return (
        <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl mb-12 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={banners[currentIndex].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-110"
                        style={{ backgroundImage: `url(${banners[currentIndex].imageUrl})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                    </div>

                    <div className="relative h-full container mx-auto px-8 flex flex-col justify-center max-w-2xl">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                                <span className="text-gradient">{banners[currentIndex].title}</span>
                            </h1>
                            {banners[currentIndex].subtitle && (
                                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                                    {banners[currentIndex].subtitle}
                                </p>
                            )}
                            <Button
                                size="xl"
                                variant="hero"
                                onClick={() => banners[currentIndex].linkUrl && (window.location.href = banners[currentIndex].linkUrl)}
                            >
                                <Ticket className="h-5 w-5 mr-2" />
                                {banners[currentIndex].buttonText || "Participar Agora"}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-8 bg-primary" : "w-2 bg-primary/30"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default BannerCarousel;
