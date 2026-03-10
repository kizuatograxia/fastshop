import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { RaffleCard } from '../../components/RaffleCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';
import { Raffle } from '../../types/raffle';

export default function SorteiosScreen() {
    const [search, setSearch] = useState('');

    const { data: raffles = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['raffles'],
        queryFn: () => api.getActiveRaffles().catch(() => []),
        staleTime: 30000,
    });

    const filtered = useMemo(() => {
        let r = (raffles as Raffle[]).filter(x => x.status === 'ativo' || x.status === 'active');
        if (search) r = r.filter(x => x.titulo?.toLowerCase().includes(search.toLowerCase()));
        return r.sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime());
    }, [raffles, search]);

    return (
        <ScreenWrapper style={s.root}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
                <LinearGradient colors={['rgba(0,255,140,0.08)', 'transparent']} style={s.header}>
                    <View style={s.headerIcon}>
                        <Trophy size={22} color="#00FF8C" />
                    </View>
                    <View>
                        <Text style={s.headerTitle}>Sorteios</Text>
                        <Text style={s.headerSub}>{filtered.length} ativos agora</Text>
                    </View>
                </LinearGradient>
            </SafeAreaView>

            <View style={s.searchWrap}>
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar sorteios..."
                    placeholderTextColor="#4b5563"
                    style={s.searchInput}
                />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00FF8C" colors={['#00FF8C']} />}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={{ paddingTop: 60, alignItems: 'center' }}>
                        <Text style={{ color: '#6b7280' }}>Carregando...</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={{ paddingTop: 60, alignItems: 'center', gap: 12 }}>
                        <Trophy size={48} color="#1f2937" />
                        <Text style={{ color: '#6b7280' }}>Nenhum sorteio encontrado</Text>
                    </View>
                ) : (
                    filtered.map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
    headerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,255,140,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,140,0.2)' },
    headerTitle: { color: '#f9fafb', fontSize: 28, fontWeight: '900' },
    headerSub: { color: '#6b7280', fontSize: 13, marginTop: 2 },
    searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
    searchInput: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#f9fafb', fontSize: 14 },
});
