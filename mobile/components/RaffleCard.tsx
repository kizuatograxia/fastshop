import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Raffle } from '../types/raffle';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';
import { Clock, Trophy, Users } from 'lucide-react-native';

interface RaffleCardProps {
    raffle: Raffle;
    index?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RaffleCardComponent = ({ raffle }: RaffleCardProps) => {
    const router = useRouter();
    
    // Calculate progress
    const totalCotas = raffle.maxParticipantes || 1000;
    const vendidas = raffle.participantes || 0;
    const progress = (vendidas / totalCotas) * 100;
    
    const isEnded = raffle.status === 'encerrado';
    const rarityColor = theme.colors.primary; // Could map this later if needed

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/raffle/${raffle.id}`);
            }}
            style={styles.container}
        >
            <View style={styles.card}>
                {/* Header Image with Overlay */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: raffle.imagem || raffle.image_urls?.[0] }}
                        style={styles.image}
                        contentFit="cover"
                        transition={300}
                    />
                    
                    {/* Status/Rarity Badges */}
                    <View style={styles.badgesContainer}>
                        <View style={[styles.badge, styles.rarityBadge]}>
                            <Text style={styles.badgeText}>{raffle.raridade?.toUpperCase() || 'COMUM'}</Text>
                        </View>
                        {isEnded && (
                            <View style={[styles.badge, styles.endedBadge]}>
                                <Trophy size={10} color="#FFD700" />
                                <Text style={[styles.badgeText, { color: '#FFD700' }]}>ENCERRADA</Text>
                            </View>
                        )}
                    </View>

                    {/* Gradient Overlay for bottom text */}
                    <LinearGradient
                        colors={['transparent', 'rgba(10, 11, 18, 0.9)']}
                        style={styles.imageGradient}
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={1}>
                        {raffle.titulo}
                    </Text>
                    
                    <View style={styles.priceRow}>
                        <Text style={styles.priceValue}>
                            R$ {raffle.premioValor?.toLocaleString('pt-BR') || raffle.premio}
                        </Text>
                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <View style={styles.statsIconRow}>
                                <Users size={12} color={theme.colors.mutedForeground} />
                                <Text style={styles.statsText}>{vendidas}/{totalCotas}</Text>
                            </View>
                            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <LinearGradient
                                colors={theme.gradients.primary as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${Math.min(100, progress)}%` }]}
                            />
                        </View>
                    </View>

                    {/* Footer / CTA Hint */}
                    <View style={styles.footer}>
                        <View style={styles.timeRow}>
                            <Clock size={12} color={theme.colors.mutedForeground} />
                            <Text style={styles.timeText}>Sorteio em breve</Text>
                        </View>
                        <Text style={styles.ctaHint}>PARTICIPAR</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%', // Slightly wider for 2 columns with gap
        marginBottom: 16,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    badgesContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(10, 11, 18, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rarityBadge: {
        // dynamic color could be here
    },
    endedBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1,
    },
    content: {
        padding: 12,
    },
    title: {
        color: theme.colors.foreground,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    priceRow: {
        marginBottom: 12,
    },
    priceValue: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '800',
    },
    progressSection: {
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statsIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statsText: {
        color: theme.colors.mutedForeground,
        fontSize: 10,
        fontWeight: '600',
    },
    progressPercent: {
        color: theme.colors.foreground,
        fontSize: 10,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        color: theme.colors.mutedForeground,
        fontSize: 9,
        fontWeight: '500',
    },
    ctaHint: {
        color: theme.colors.primary,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export const RaffleCard = React.memo(RaffleCardComponent, (prev, next) => {
    return prev.raffle.id === next.raffle.id && 
           prev.raffle.status === next.raffle.status &&
           prev.raffle.participantes === next.raffle.participantes;
});
