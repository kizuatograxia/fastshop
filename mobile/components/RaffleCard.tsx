import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Raffle } from '../types/raffle';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface RaffleCardProps {
    raffle: Raffle;
    index?: number;
}

const RaffleCardComponent = ({ raffle }: RaffleCardProps) => {
    const router = useRouter();
    const premioValor = raffle.premioValor
        ? `R$ ${raffle.premioValor.toLocaleString('pt-BR')}`
        : raffle.premio;
    const imageUri = raffle.imagem || raffle.image_urls?.[0]
        || 'https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80';

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
                {/* Prize Value Badge */}
                <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>{premioValor}</Text>
                </View>

                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        contentFit="cover"
                        transition={300}
                    />
                </View>

                {/* Title */}
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
        width: '47%',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#111827',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        overflow: 'hidden',
    },
    rewardBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: 'rgba(20,24,39,0.85)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rewardText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 10,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 5,
        backgroundColor: '#0A0B12',
        padding: 12,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    content: {
        padding: 12,
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        color: '#f9fafb',
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
    },
});

export const RaffleCard = React.memo(RaffleCardComponent, (prev, next) => {
    return prev.raffle.id === next.raffle.id;
});
