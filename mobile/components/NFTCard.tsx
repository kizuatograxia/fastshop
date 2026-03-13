import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart, Star, Ticket } from 'lucide-react-native';
import { Image } from 'expo-image';
import { theme } from '../lib/theme';
import { getRarityConfig } from '../lib/rarity';

interface NFTCardProps {
    nft: any;
    onBuy: (nft: any) => void;
    buying: boolean;
}

const NFTCardComponent = ({ nft, onBuy, buying }: NFTCardProps) => {
    const rarity = getRarityConfig(nft.raridade);

    return (
        <View style={[styles.card, { borderColor: rarity.border }]}>
            <View style={styles.rarityContainer}>
                <View style={[styles.rarityBadge, { backgroundColor: rarity.bg, borderColor: rarity.border, borderWidth: 1 }]}>
                    <Star size={10} color={rarity.color} fill={rarity.color} />
                    <Text style={[styles.rarityText, { color: rarity.color }]}>{rarity.label}</Text>
                </View>
            </View>

            <View style={[styles.visualArea, { backgroundColor: rarity.bg }]}>
                {nft.image ? (
                    <Image
                        source={nft.image}
                        style={styles.nftImage}
                        contentFit="contain"
                        transition={300}
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <Text style={styles.nftEmoji}>{nft.emoji}</Text>
                )}
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.nftName} numberOfLines={1}>{nft.nome}</Text>
                <View style={styles.priceRow}>
                    <View style={styles.priceWrapper}>
                        <Ticket size={14} color={theme.colors.success} />
                        <Text style={styles.priceText}>{Math.floor(nft.preco)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => onBuy(nft)}
                        disabled={buying}
                        activeOpacity={0.7}
                    >
                        <ShoppingCart size={14} color={theme.colors.primaryForeground} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export const NFTCard = React.memo(NFTCardComponent, (prev, next) => {
    return prev.nft.id === next.nft.id && 
           prev.buying === next.buying && 
           prev.nft.quantidade === next.nft.quantidade;
});

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.4)',
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginHorizontal: 6,
        marginBottom: 16,
        height: 230,
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
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.md,
    },
    rarityText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    visualArea: {
        height: 130,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    },
    nftEmoji: { fontSize: 48 },
    nftImage: { width: '80%', height: '80%' },
    cardContent: { 
        padding: 12, 
        flex: 1, 
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    nftName: {
        color: theme.colors.foreground,
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 0.2,
    },
    priceRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    priceText: { 
        color: theme.colors.primary, 
        fontWeight: '900', 
        fontSize: 16 
    },
    buyBtn: {
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
});
