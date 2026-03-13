import React, { useState, useMemo, useRef } from 'react';
import {
    View, Text, ScrollView, RefreshControl, 
    StatusBar, StyleSheet, TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { RaffleCard } from '../../components/RaffleCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { CategoryNav } from '../../components/CategoryNav';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Raffle } from '../../types/raffle';
import { Search, Trophy } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hero } from '../../components/Hero';

export default function Home() {
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('todos');

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

    const activeCount = filtered.length;

    return (
        <ScreenWrapper style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                ref={scrollRef}
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
                    <Hero 
                        activeRafflesCount={activeCount}
                        onCollectionPress={() => router.push('/(tabs)/nfts')}
                        onCtaPress={() => {
                            scrollRef.current?.scrollTo({ y: 400, animated: true });
                        }}
                    />
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
