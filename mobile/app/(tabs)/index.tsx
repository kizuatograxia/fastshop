import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, RefreshControl, TouchableOpacity,
    StatusBar, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { RaffleCard } from '../../components/RaffleCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { CategoryNav } from '../../components/CategoryNav';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Raffle } from '../../types/raffle';
import { Search, Trophy, ArrowRight } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Hero Inner Component without redundant grid


export default function Home() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');
    const fadeTitle = useRef(new Animated.Value(0)).current;
    const fadeSub = useRef(new Animated.Value(0)).current;
    const fadeStats = useRef(new Animated.Value(0)).current;
    const slideBtns = useRef(new Animated.Value(20)).current;

    const { data: raffles = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['raffles'],
        queryFn: async () => {
            try { return await api.getActiveRaffles(); }
            catch { return []; }
        },
        staleTime: 30000,
    });

    const filtered = useMemo(() => {
        let r = (raffles as Raffle[]).filter(x => x.status === 'ativo' || x.status === 'active');
        if (search) r = r.filter(x => x.titulo?.toLowerCase().includes(search.toLowerCase()));
        if (activeCategory !== 'todos') r = r.filter(x => x.categoria === activeCategory);
        return r.sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime());
    }, [raffles, search, activeCategory]);

    // Entrance animations
    useEffect(() => {
        Animated.stagger(120, [
            Animated.timing(fadeTitle, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(fadeSub, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(fadeStats, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(slideBtns, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const activeCount = filtered.length;

    return (
        <ScreenWrapper style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#00FF8C"
                        colors={['#00FF8C']}
                    />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* ── HERO ─────────────────────────────── */}
                <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
                    <View style={styles.hero}>
                        <View style={styles.heroInner}>
                            {/* Audit badge */}
                            <Animated.View style={[styles.auditBadge, { opacity: fadeTitle }]}>
                                <View style={styles.auditDot} />
                                <Text style={styles.auditText}>AUDITORIA CONCLUÍDA</Text>
                                <View style={styles.auditAvatars}>
                                    {['https://i.pravatar.cc/100?img=11', 'https://i.pravatar.cc/100?img=12', 'https://i.pravatar.cc/100?img=13'].map((uri, i) => (
                                        <View key={i} style={[styles.auditAvatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]}>
                                            <Animated.Image source={{ uri }} style={styles.auditAvatarImg} />
                                        </View>
                                    ))}
                                    <View style={[styles.auditAvatar, styles.auditAvatarGreen, { marginLeft: -8 }]}>
                                        <Text style={styles.auditAvatarCount}>+12k</Text>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* Big title */}
                            <Animated.Text style={[styles.heroH1, { opacity: fadeTitle }]}>
                                Ativos digitais.{'\n'}
                                <Text style={styles.heroH1Green}>Retornos reais.</Text>
                            </Animated.Text>

                            {/* Subtitle */}
                            <Animated.Text style={[styles.heroSub, { opacity: fadeSub }]}>
                                Uma plataforma premium de colecionáveis digitais. Adquira NFTs verificados para acesso exclusivo a alocações de alto valor.
                            </Animated.Text>

                            {/* CTA Buttons */}
                            <Animated.View style={[styles.ctaRow, { opacity: fadeSub, transform: [{ translateY: slideBtns }] }]}>
                                <TouchableOpacity
                                    style={styles.ctaPrimary}
                                    activeOpacity={0.85}
                                    onPress={() => { /* scroll down */ }}
                                >
                                    <Text style={styles.ctaPrimaryText}>ACESSAR ALOCAÇÕES</Text>
                                    <ArrowRight size={14} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.ctaSecondary}
                                    activeOpacity={0.85}
                                    onPress={() => router.push('/(tabs)/nfts')}
                                >
                                    <Text style={styles.ctaSecondaryText}>VER COLEÇÃO</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Stats */}
                            <Animated.View style={[styles.statsRow, { opacity: fadeStats }]}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>VOLUME TOTAL</Text>
                                    <Text style={styles.statValue}>R$ 2.4M+</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>SORTEIOS ATIVOS</Text>
                                    <Text style={styles.statValue}>{activeCount}</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>TAXA DE SUCESSO</Text>
                                    <Text style={styles.statValue}>100%</Text>
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                </SafeAreaView>

                {/* ── SEARCH ───────────────────────────── */}
                <View style={styles.searchContainer}>
                    <Search size={16} color="#4b5563" style={{ position: 'absolute', left: 14, zIndex: 1, top: 14 }} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar sorteios..."
                        placeholderTextColor="#4b5563"
                        style={styles.searchInput}
                    />
                </View>

                <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

                {/* ── RAFFLE LIST ──────────────────────── */}
                <View style={styles.listContainer}>
                    {isLoading ? (
                        <View style={{ gap: 16 }}>
                            {[1, 2].map(i => (
                                <View key={i} style={styles.skeletonCard}>
                                    <Skeleton height={420} borderRadius={16} />
                                </View>
                            ))}
                        </View>
                    ) : filtered.length === 0 ? (
                        <View style={{ paddingTop: 60, alignItems: 'center', gap: 8 }}>
                            <Trophy size={48} color="#1f2937" />
                            <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                                Nenhum sorteio encontrado
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.raffleGrid}>
                            {filtered.map((raffle, i) => (
                                <RaffleCard key={raffle.id} raffle={raffle} index={i} />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    // ── HERO
    hero: {
        minHeight: 480,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(31,41,55,0.3)',
    },
    heroInner: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 36,
    },
    auditBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(31,41,55,0.7)',
        backgroundColor: 'rgba(17,24,39,0.5)',
        alignSelf: 'flex-start',
    },
    auditDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00FF8C',
    },
    auditText: {
        color: '#6b7280',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 2,
    },
    auditAvatars: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    auditAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#0A0B12',
        overflow: 'hidden',
        backgroundColor: '#1f2937',
    },
    auditAvatarImg: {
        width: 20,
        height: 20,
    },
    auditAvatarGreen: {
        backgroundColor: '#00FF8C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    auditAvatarCount: {
        color: '#000',
        fontSize: 6,
        fontWeight: '900',
    },
    heroH1: {
        fontSize: 40,
        fontWeight: '900',
        color: '#f9fafb',
        lineHeight: 46,
        letterSpacing: -1.5,
        marginBottom: 16,
    },
    heroH1Green: {
        color: '#00FF8C',
    },
    heroSub: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 22,
        marginBottom: 28,
        fontWeight: '300',
    },
    ctaRow: {
        gap: 12,
        marginBottom: 36,
    },
    ctaPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00FF8C',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    ctaPrimaryText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    ctaSecondary: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: 'rgba(31,41,55,0.8)',
        backgroundColor: 'rgba(17,24,39,0.4)',
    },
    ctaSecondaryText: {
        color: '#f9fafb',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(31,41,55,0.5)',
        paddingTop: 20,
        gap: 0,
    },
    statItem: {
        flex: 1,
        gap: 4,
    },
    statLabel: {
        color: '#6b7280',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    statValue: {
        color: '#f9fafb',
        fontSize: 18,
        fontWeight: '800',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(31,41,55,0.5)',
        marginHorizontal: 16,
    },
    // Search
    searchContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        position: 'relative',
    },
    searchInput: {
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: 12,
        paddingLeft: 40,
        paddingRight: 14,
        paddingVertical: 12,
        color: '#f9fafb',
        fontSize: 14,
    },
    // List
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    skeletonCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    raffleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
