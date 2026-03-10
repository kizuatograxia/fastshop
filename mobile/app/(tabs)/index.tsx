import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, RefreshControl, TouchableOpacity,
    Image, StatusBar, StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { RaffleCard } from '../../components/RaffleCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { CategoryNav } from '../../components/CategoryNav';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Raffle } from '../../types/raffle';
import { Search, Trophy, Zap, Users } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
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

    const totalVolume = 'R$ 2.4M+';
    const activeCount = filtered.length;

    return (
        <ScreenWrapper style={{ flex: 1, backgroundColor: 'transparent' }}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
                {/* Hero Header */}
                <LinearGradient
                    colors={['rgba(0,255,140,0.08)', 'transparent']}
                    style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
                >
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.heroTitle}>MundoPix</Text>
                            <Text style={styles.heroSub}>Ativos digitais. Retornos reais.</Text>
                        </View>
                        <View style={styles.heroBadge}>
                            <View style={styles.liveIndicator} />
                            <Text style={styles.liveText}>AO VIVO</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Zap size={14} color="#00FF8C" />
                            <Text style={styles.statValue}>{totalVolume}</Text>
                            <Text style={styles.statLabel}>Volume Total</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Trophy size={14} color="#00FF8C" />
                            <Text style={styles.statValue}>{activeCount}</Text>
                            <Text style={styles.statLabel}>Sorteios Ativos</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Users size={14} color="#00FF8C" />
                            <Text style={styles.statValue}>100%</Text>
                            <Text style={styles.statLabel}>Taxa de Sucesso</Text>
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>

            {/* Search */}
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

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#00FF8C"
                        colors={['#00FF8C']}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ gap: 16 }}>
                        {[1, 2, 3].map(i => (
                            <View key={i} style={styles.skeletonCard}>
                                <Skeleton height={200} borderRadius={20} />
                                <View style={{ padding: 16, gap: 8 }}>
                                    <Skeleton width="60%" height={24} />
                                    <Skeleton width="40%" height={16} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                        <Skeleton width="30%" height={12} />
                                        <Skeleton width="30%" height={12} />
                                    </View>
                                </View>
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
                    filtered.map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#00FF8C', letterSpacing: -1 },
    heroSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.3)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF8C' },
    liveText: { color: '#00FF8C', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    statsRow: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
    statValue: { color: '#f9fafb', fontSize: 16, fontWeight: '800' },
    statLabel: { color: '#4b5563', fontSize: 10, fontWeight: '500' },
    statDivider: { width: 1, backgroundColor: '#1f2937', marginVertical: 12 },
    searchContainer: { marginHorizontal: 16, marginBottom: 8, position: 'relative' },
    searchInput: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, paddingLeft: 40, paddingRight: 14, paddingVertical: 12, color: '#f9fafb', fontSize: 14 },
    skeletonCard: { backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' },
});
