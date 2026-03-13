import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroProps {
    onCtaPress?: () => void;
    onCollectionPress?: () => void;
    activeRafflesCount?: number;
}

export const Hero = ({ onCtaPress, onCollectionPress, activeRafflesCount = 0 }: HeroProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Background Glow */}
            <LinearGradient
                colors={['rgba(0, 255, 140, 0.05)', 'transparent']}
                style={styles.glow}
            />

            <View style={styles.content}>
                {/* Badge */}
                <Animated.View style={[styles.badgeContainer, { opacity: fadeAnim }]}>
                    <View style={styles.badge}>
                        <ShieldCheck size={12} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>RIFA DE ESTREIA</Text>
                    </View>
                </Animated.View>

                {/* Headline */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={styles.headline}>
                        Ativos digitais.{'\n'}
                        <Text style={styles.headlineHighlight}>Retornos reais.</Text>
                    </Text>
                </Animated.View>

                {/* Subtitle */}
                <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
                    Uma plataforma premium de colecionáveis digitais. Adquira NFTs verificados para acesso exclusivo a alocações de alto valor.
                </Animated.Text>

                {/* CTA Buttons */}
                <Animated.View style={[styles.ctaContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity
                        style={styles.primaryCta}
                        activeOpacity={0.8}
                        onPress={onCtaPress}
                    >
                        <LinearGradient
                            colors={theme.gradients.primary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryCtaGradient}
                        >
                            <Text style={styles.primaryCtaText}>PARTICIPAR AGORA</Text>
                            <ArrowRight size={16} color={theme.colors.background} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryCta}
                        activeOpacity={0.7}
                        onPress={onCollectionPress}
                    >
                        <Text style={styles.secondaryCtaText}>VER COLEÇÃO</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Stats Row */}
                <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>VOLUME TOTAL</Text>
                        <Text style={styles.statValue}>R$ 2.4M+</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>SORTEIOS ATIVOS</Text>
                        <Text style={styles.statValue}>{activeRafflesCount}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>TAXA DE SUCESSO</Text>
                        <Text style={styles.statValue}>100%</Text>
                    </View>
                </Animated.View>
            </View>

            {/* Live Showcase - Simplified for mobile */}
            <View style={styles.showcase}>
                <LinearGradient
                    colors={['transparent', 'rgba(7, 8, 14, 0.18)', 'transparent']}
                    locations={[0, 0.55, 1]}
                    style={styles.showcaseOverlay}
                />
                {/* Showcase content (e.g., small cards or carousel) would go here */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        paddingTop: 20,
        backgroundColor: 'transparent',
    },
    glow: {
        position: 'absolute',
        top: -100,
        left: 0,
        right: 0,
        height: 300,
    },
    content: {
        paddingHorizontal: 24,
        zIndex: 1,
    },
    badgeContainer: {
        marginBottom: 24,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
    },
    headline: {
        fontSize: 42,
        fontWeight: '900',
        color: theme.colors.foreground,
        lineHeight: 48,
        letterSpacing: -1,
        marginBottom: 16,
    },
    headlineHighlight: {
        color: theme.colors.primary,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.mutedForeground,
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '400',
    },
    ctaContainer: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 40,
    },
    primaryCta: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryCtaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
    },
    primaryCtaText: {
        color: theme.colors.background,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    secondaryCta: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryCtaText: {
        color: theme.colors.foreground,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        color: theme.colors.mutedForeground,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        color: theme.colors.foreground,
        fontSize: 18,
        fontWeight: '800',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginHorizontal: 12,
    },
    showcase: {
        height: 100,
        position: 'relative',
    },
    showcaseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
});
