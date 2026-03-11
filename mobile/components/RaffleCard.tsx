import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Raffle } from '../types/raffle';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface RaffleCardProps {
    raffle: Raffle;
}

/**
 * EXACT WEB PARITY RAFFLE CARD (Mobile Layout)
 * Mirrored from src/components/RaffleCard.tsx (Mobile view)
 * Minimalist design: 4:5 Image, Prize Badge, Title. No clutter.
 */
const RaffleCardComponent = ({ raffle }: RaffleCardProps) => {
    const router = useRouter();
    const premioValor = raffle.premioValor ? `R$ ${raffle.premioValor.toLocaleString('pt-BR')}` : raffle.premio;
    const imageUri = raffle.imagem || raffle.image_urls?.[0] || 'https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80';

    // Check if raffle targets a 3D model
    const is3D = raffle.titulo?.toLowerCase().includes('arara') || imageUri.includes('.glb');

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/raffle/${raffle.id}`);
            }}
            style={styles.container}
        >
            <View style={styles.card}>
                {/* Prize Value Badge (top-2 right-2) */}
                <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>{premioValor}</Text>
                </View>

                {/* Image Container (aspect-[4/5] bg-background p-3) */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>

                {/* Content Preview (Always visible p-3) */}
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>
                        {raffle.titulo}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 6,
    },
    card: {
        backgroundColor: '#111827', // bg-card
        borderRadius: 16, // rounded-2xl
        borderWidth: 1,
        borderColor: '#1f2937', // border-border
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    // Web: absolute top-2 right-2 z-10 glass-card px-1.5 py-0.5 rounded-md text-[10px] font-bold
    rewardBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: 'rgba(20, 24, 39, 0.85)', // glass approximation
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rewardText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 10
    },
    // Web: relative w-full aspect-[4/5] overflow-hidden bg-background p-3
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 5,
        backgroundColor: '#0A0B12', // bg-background
        padding: 12, // p-3
    },
    // Web: w-full h-full object-cover rounded-xl
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12, // rounded-xl
    },
    // Web: p-3 flex-1 flex flex-col justify-end
    content: {
        padding: 12,
        flex: 1,
        justifyContent: 'flex-end'
    },
    // Web: font-bold text-sm text-foreground leading-tight line-clamp-2
    title: {
        color: '#f9fafb', // text-foreground
        fontSize: 14, // text-sm
        fontWeight: '700', // font-bold
        lineHeight: 18, // leading-tight
    },
});

export const RaffleCard = React.memo(RaffleCardComponent, (prev, next) => {
    return prev.raffle.id === next.raffle.id;
});
