import React from "react";
import NFTCard from "./NFTCard";
import NFTMobilePreview from "./NFTMobilePreview";
import { NFT } from "@/types/raffle";
import { Gift } from "lucide-react";

interface NFTGridProps {
    nfts: NFT[];
}

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
            <div className="hidden sm:grid grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {nfts.map((nft, index) => (
                    <NFTCard key={nft.id} nft={nft} index={index} />
                ))}
            </div>
        </section>
    );
};

export default NFTGrid;
