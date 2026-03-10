import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Raffle } from '../types/raffle';
import { Clock, Ticket } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface RaffleCardProps {
    raffle: Raffle;
}

const RaffleCardComponent = ({ raffle }: RaffleCardProps) => {
    const router = useRouter();
    const progress = Math.min((raffle.participantes / raffle.maxParticipantes) * 100, 100);
    const custo = typeof raffle.custoNFT === 'number' ? raffle.custoNFT.toFixed(2) : '0.00';
    const imageUri = raffle.imagem || raffle.image_urls?.[0] || 'https://placehold.co/600x400/111827/00FF8C';
    const isAlmostFull = progress >= 80;

    let endDate: Date;
    try { endDate = new Date(raffle.dataFim); }
    catch { endDate = new Date(); }

    const pulse = useSharedValue(1);

    React.useEffect(() => {
        if (isAlmostFull) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                true
            );
        } else {
            pulse.value = 1;
        }
    }, [isAlmostFull]);

    const animatedProgressStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: pulse.value }],
        opacity: isAlmostFull ? pulse.value : 1,
    }));

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/raffle/${raffle.id}`);
            }}
            style={styles.container}
            accessibilityLabel={`Sorteio ${raffle.titulo}. Prêmio: ${raffle.premio}. Valor da cota: R$ ${custo}`}
            accessibilityRole="button"
        >
            <View style={styles.card}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(10,11,18,0.95)']}
                        style={styles.gradient}
                    />
                    {/* Price badge */}
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>R$ {custo}</Text>
                    </View>
                    {/* Category badge */}
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{raffle.categoria?.toUpperCase() || 'TECH'}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={1}>{raffle.titulo}</Text>
                    <Text style={styles.prize} numberOfLines={1}>{raffle.premio}</Text>

                    <View style={styles.meta}>
                        <View style={styles.metaItem}>
                            <Ticket size={13} color="#4b5563" />
                            <Text style={styles.metaText}>
                                {raffle.participantes}/{raffle.maxParticipantes} cotas
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={13} color="#4b5563" />
                            <Text style={styles.metaText}>
                                {formatDistanceToNow(endDate, { locale: ptBR, addSuffix: true })}
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBg}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: `${progress}%` as any },
                                isAlmostFull && styles.progressFillHot,
                                isAlmostFull && animatedProgressStyle,
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressLabel, isAlmostFull && styles.progressLabelHot]}>
                        {progress.toFixed(0)}% preenchido{isAlmostFull ? ' — quase esgotado!' : ''}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    card: { backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' },
    imageContainer: { height: 200, position: 'relative' },
    image: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
    priceBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#00FF8C', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    priceText: { color: '#0A0B12', fontWeight: '800', fontSize: 13 },
    categoryBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(10,11,18,0.7)', borderWidth: 1, borderColor: '#1f2937', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    categoryText: { color: '#6b7280', fontWeight: '700', fontSize: 9, letterSpacing: 1 },
    content: { padding: 16 },
    title: { color: '#f9fafb', fontSize: 18, fontWeight: '800', marginBottom: 2 },
    prize: { color: '#00FF8C', fontSize: 13, fontWeight: '600', marginBottom: 12 },
    meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { color: '#4b5563', fontSize: 12 },
    progressBg: { height: 4, backgroundColor: '#1f2937', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
    progressFill: { height: '100%', backgroundColor: '#00FF8C', borderRadius: 2 },
    progressFillHot: { backgroundColor: '#f97316' },
    progressLabel: { color: '#4b5563', fontSize: 11 },
    progressLabelHot: { color: '#f97316' },
});

export const RaffleCard = React.memo(RaffleCardComponent, (prev, next) => {
    return (
        prev.raffle.id === next.raffle.id &&
        prev.raffle.participantes === next.raffle.participantes &&
        prev.raffle.status === next.raffle.status
    );
});
