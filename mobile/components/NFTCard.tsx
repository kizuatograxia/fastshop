import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart, Star, Ticket } from 'lucide-react-native';
import { Image } from 'expo-image';

interface NFTCardProps {
    nft: any;
    onBuy: (nft: any) => void;
    buying: boolean;
}

const NFTCardComponent = ({ nft, onBuy, buying }: NFTCardProps) => {
    const rarityColor = nft.cor ? nft.cor.split(' ')[0].replace('from-', '') : '#1f2937';

    return (
        <View style={[s.card, { borderColor: rarityColor || 'rgba(31, 41, 55, 0.6)' }]}>
            <View style={s.rarityContainer}>
                <View style={[s.rarityBadge, { backgroundColor: rarityColor || '#1f2937' }]}>
                    <Star size={10} color="#fff" fill="#fff" />
                    <Text style={s.rarityText}>{nft.raridade}</Text>
                </View>
            </View>

            <View style={[s.visualArea, { backgroundColor: (rarityColor || '#1f2937') + '20' }]}>
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
                <Text style={s.nftName} numberOfLines={2}>{nft.nome}</Text>
                <View style={[s.priceRow, { marginTop: 8 }]}>
                    <View style={s.priceWrapper}>
                        <Ticket size={14} color="#16a34a" />
                        <Text style={s.priceText}>{Math.floor(nft.preco)}</Text>
                    </View>
                    <TouchableOpacity
                        style={s.buyBtn}
                        onPress={() => onBuy(nft)}
                        disabled={buying}
                        activeOpacity={0.6}
                    >
                        <ShoppingCart size={14} color="#0A0B12" />
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
        backgroundColor: '#111827', // Matching RaffleCard block
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1f2937',
        marginHorizontal: 6,
        marginBottom: 16,
        height: 220, // Taller size to match web Cyber-Luxury height
        shadowColor: '#000',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
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
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    visualArea: {
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    nftEmoji: { fontSize: 48 },
    nftImage: { width: '85%', height: '85%' },
    cardContent: { padding: 12, flex: 1, justifyContent: 'space-between' },
    nftName: {
        color: '#f9fafb',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.1,
    },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
