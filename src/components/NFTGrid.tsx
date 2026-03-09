import { FC } from "react";
import NFTCard from "./NFTCard";
import NFTMobilePreview from "./NFTMobilePreview";
import { NFT } from "@/types/raffle";
import { Gift } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface NFTGridProps {
    nfts: NFT[];
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const NFTGrid: React.FC<NFTGridProps> = ({ nfts }) => {
    return (
        <section id="nfts" className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-accent/10 rounded-lg">
                    <Gift className="h-6 w-6 text-accent" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Comprar NFTs
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Adquira NFTs para participar dos sorteios
                    </p>
                </div>
            </div>

            {/* Mobile View: Custom Preview */}
            <div className="sm:hidden mt-4">
                <NFTMobilePreview nfts={nfts} />
            </div>

            {/* Desktop/Tablet View: Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="hidden sm:block columns-3 lg:columns-4 gap-4 md:gap-6"
            >
                {nfts.map((nft, index) => (
                    <motion.div
                        key={nft.id}
                        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                        className="inline-block w-full break-inside-avoid mb-6"
                    >
                        <NFTCard nft={nft} index={index} />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default NFTGrid;
