import React from 'react';
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    StyleSheet, StatusBar, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { api } from '../../lib/api';
import { User, Trophy, LogOut, ChevronRight, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const { data: userRaffles = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['user-raffles', user?.id],
        queryFn: () => user ? api.getUserRaffles(Number(user.id)).catch(() => []) : [],
        enabled: !!user,
    });

    const handleLogout = () => {
        Alert.alert('Sair', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: signOut },
        ]);
    };

    if (!user) return null;

    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
    const activeRaffles = (userRaffles as any[]).filter(ur => ur.raffle?.status === 'ativo' || ur.raffle?.status === 'active');

    return (
        <ScreenWrapper style={s.root}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00FF8C" colors={['#00FF8C']} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header with gradient */}
                <LinearGradient colors={['rgba(0,255,140,0.1)', 'transparent']} style={s.headerGradient}>
                    <SafeAreaView edges={['top']}>
                        <View style={s.profileSection}>
                            <View style={s.avatarRing}>
                                <View style={s.avatar}>
                                    <Text style={s.avatarText}>{initial}</Text>
                                </View>
                            </View>
                            <Text style={s.name}>{user.name || 'Usuário'}</Text>
                            <Text style={s.email}>{user.email}</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* Stats */}
                <View style={s.statsRow}>
                    <View style={s.statCard}>
                        <Text style={s.statValue}>{(userRaffles as any[]).length}</Text>
                        <Text style={s.statLabel}>Sorteios</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCard}>
                        <Text style={s.statValue}>{activeRaffles.length}</Text>
                        <Text style={s.statLabel}>Ativos</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCard}>
                        <Text style={s.statValue}>
                            {(userRaffles as any[]).reduce((sum: number, ur: any) => sum + (ur.ticketsComprados || 0), 0)}
                        </Text>
                        <Text style={s.statLabel}>Cotas</Text>
                    </View>
                </View>

                {/* Active Raffles */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Sorteios Ativos</Text>
                    {isLoading ? (
                        <Text style={s.emptyText}>Carregando...</Text>
                    ) : activeRaffles.length === 0 ? (
                        <View style={s.emptyBox}>
                            <Trophy size={32} color="#1f2937" />
                            <Text style={s.emptyText}>Você ainda não está participando de nenhum sorteio.</Text>
                        </View>
                    ) : (
                        activeRaffles.map((ur: any) => (
                            <TouchableOpacity
                                key={ur.raffle.id}
                                style={s.raffleItem}
                                onPress={() => router.push(`/raffle/${ur.raffle.id}`)}
                            >
                                <Image
                                    source={{ uri: ur.raffle.imagem || 'https://placehold.co/80x80/111827/00FF8C' }}
                                    style={s.raffleThumb}
                                    resizeMode="cover"
                                />
                                <View style={s.raffleInfo}>
                                    <Text style={s.raffleTitle} numberOfLines={1}>{ur.raffle.titulo}</Text>
                                    <View style={s.raffleMeta}>
                                        <Ticket size={12} color="#4b5563" />
                                        <Text style={s.raffleMetaText}>{ur.ticketsComprados} cota(s)</Text>
                                    </View>
                                </View>
                                <ChevronRight size={16} color="#4b5563" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Logout */}
                <View style={s.section}>
                    <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                        <LogOut size={18} color="#ef4444" />
                        <Text style={s.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },
    headerGradient: { paddingBottom: 24 },
    profileSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 8 },
    avatarRing: { padding: 3, borderRadius: 50, borderWidth: 2, borderColor: '#00FF8C', marginBottom: 12 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,255,140,0.15)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#00FF8C', fontSize: 32, fontWeight: '900' },
    name: { color: '#f9fafb', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    email: { color: '#6b7280', fontSize: 14 },
    statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 24, backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4 },
    statValue: { color: '#f9fafb', fontSize: 20, fontWeight: '800' },
    statLabel: { color: '#4b5563', fontSize: 11 },
    statDivider: { width: 1, backgroundColor: '#1f2937', marginVertical: 12 },
    section: { marginHorizontal: 16, marginBottom: 24 },
    sectionTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '800', marginBottom: 12 },
    emptyBox: { alignItems: 'center', gap: 12, paddingVertical: 32, backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1f2937' },
    emptyText: { color: '#6b7280', textAlign: 'center', fontSize: 13, paddingHorizontal: 20 },
    raffleItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#1f2937', padding: 12, marginBottom: 8 },
    raffleThumb: { width: 52, height: 52, borderRadius: 10 },
    raffleInfo: { flex: 1 },
    raffleTitle: { color: '#f9fafb', fontWeight: '700', fontSize: 14, marginBottom: 4 },
    raffleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    raffleMetaText: { color: '#4b5563', fontSize: 12 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: 16 },
    logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
