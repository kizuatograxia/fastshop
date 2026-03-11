import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart, Star } from 'lucide-react-native';
import { Image } from 'expo-image';

interface NFTCardProps {
    nft: any;
    onBuy: (nft: any) => void;
    buying: boolean;
}

const NFTCardComponent = ({ nft, onBuy, buying }: NFTCardProps) => {
    const rarityColor = nft.cor ? nft.cor.split(' ')[0].replace('from-', '') : '#1f2937';

    return (
        <View style={s.card}>
            <View style={s.rarityContainer}>
                <View style={[s.rarityBadge, { backgroundColor: rarityColor || '#1f2937' }]}>
                    <Star size={8} color="#fff" fill="#fff" />
                    <Text style={s.rarityText}>{nft.raridade}</Text>
                </View>
            </View>

            <View style={[s.visualArea, { backgroundColor: (rarityColor || '#1f2937') + '10' }]}>
                {nft.image ? (
                    <Image
                        source={nft.image}
                        style={s.nftImage}
                        contentFit="contain"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <Text style={s.nftEmoji}>{nft.emoji}</Text>
                )}
            </View>

            <View style={s.cardContent}>
                <Text style={s.nftName} numberOfLines={1}>{nft.nome}</Text>
                <View style={s.priceRow}>
                    <View style={s.priceWrapper}>
                        <View style={s.ticketIcon} />
                        <Text style={s.priceText}>{Math.floor(nft.preco)}</Text>
                    </View>
                    <TouchableOpacity
                        style={s.buyBtn}
                        onPress={() => onBuy(nft)}
                        disabled={buying}
                        activeOpacity={0.6}
                    >
                        <ShoppingCart size={13} color="#0A0B12" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export const NFTCard = React.memo(NFTCardComponent, (prev, next) => {
    return prev.nft.id === next.nft.id && prev.buying === next.buying;
});

const s = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.55)',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.6)',
        margin: 6,
        height: 195,
        // Glassmorphism-like depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    rarityContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
    },
    rarityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    rarityText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    visualArea: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nftEmoji: { fontSize: 36 },
    nftImage: { width: '80%', height: '80%' },
    cardContent: { padding: 10, flex: 1, justifyContent: 'space-between' },
    nftName: {
        color: '#f9fafb',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.1,
    },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ticketIcon: {
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: '#16a34a',
    },
    priceText: { color: '#00FF8C', fontWeight: '900', fontSize: 15 },
    buyBtn: {
        backgroundColor: '#00FF8C',
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
