import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Star, Trophy, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function WinnersScreen() {
    const { data: winners = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['winners'],
        queryFn: () => api.getWinners().catch(() => []),
        staleTime: 60000,
    });

    return (
        <ScreenWrapper style={s.root}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
                <LinearGradient
                    colors={['rgba(0,255,140,0.08)', 'transparent']}
                    style={s.header}
                >
                    <View style={s.headerIcon}>
                        <Star size={22} color="#00FF8C" fill="#00FF8C" />
                    </View>
                    <View>
                        <Text style={s.headerTitle}>Ganhadores</Text>
                        <Text style={s.headerSub}>Histórico de sorteios realizados</Text>
                    </View>
                </LinearGradient>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00FF8C" colors={['#00FF8C']} />}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={s.emptyState}>
                        <Text style={s.emptyText}>Carregando...</Text>
                    </View>
                ) : winners.length === 0 ? (
                    <View style={s.emptyState}>
                        <Trophy size={48} color="#1f2937" />
                        <Text style={s.emptyTitle}>Nenhum ganhador ainda</Text>
                        <Text style={s.emptyText}>Os sorteios realizados aparecerão aqui.</Text>
                    </View>
                ) : (
                    winners.map((winner: any, i: number) => (
                        <WinnerCard key={winner.id || i} winner={winner} position={i + 1} />
                    ))
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

function WinnerCard({ winner, position }: { winner: any; position: number }) {
    const imageUri = winner.image || winner.imagem || 'https://placehold.co/600x400/111827/00FF8C';
    const isTop3 = position <= 3;

    return (
        <View style={[ws.card, isTop3 && ws.cardTop]}>
            <Image source={{ uri: imageUri }} style={ws.image} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(10,11,18,0.95)']} style={ws.gradient} />

            <View style={ws.positionBadge}>
                <Text style={ws.positionText}>#{position}</Text>
            </View>

            <View style={ws.content}>
                <Text style={ws.prizeText}>{winner.prize || winner.premio || winner.titulo}</Text>
                <View style={ws.winnerRow}>
                    <View style={ws.avatar}>
                        <Text style={ws.avatarText}>
                            {(winner.winner_name || winner.name || 'A').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={ws.winnerName}>{winner.winner_name || winner.name || 'Ganhador'}</Text>
                        {winner.created_at && (
                            <Text style={ws.winnerDate}>
                                {formatDistanceToNow(new Date(winner.created_at), { locale: ptBR, addSuffix: true })}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
    headerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,255,140,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,255,140,0.2)' },
    headerTitle: { color: '#f9fafb', fontSize: 28, fontWeight: '900' },
    headerSub: { color: '#6b7280', fontSize: 13, marginTop: 2 },
    emptyState: { paddingTop: 80, alignItems: 'center', gap: 12 },
    emptyTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '700' },
    emptyText: { color: '#6b7280', textAlign: 'center' },
});

const ws = StyleSheet.create({
    card: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', height: 180, position: 'relative', borderWidth: 1, borderColor: '#1f2937' },
    cardTop: { borderColor: 'rgba(0,255,140,0.3)' },
    image: { width: '100%', height: '100%', position: 'absolute' },
    gradient: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
    positionBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#00FF8C', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    positionText: { color: '#0A0B12', fontWeight: '800', fontSize: 12 },
    content: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
    prizeText: { color: '#f9fafb', fontSize: 18, fontWeight: '800', marginBottom: 8 },
    winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,255,140,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#00FF8C' },
    avatarText: { color: '#00FF8C', fontWeight: '700', fontSize: 14 },
    winnerName: { color: '#f9fafb', fontWeight: '700', fontSize: 14 },
    winnerDate: { color: '#6b7280', fontSize: 11 },
});
