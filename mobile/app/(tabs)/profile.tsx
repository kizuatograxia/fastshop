import React, { useState } from 'react';
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    StyleSheet, StatusBar, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { api } from '../../lib/api';
import { User, Trophy, LogOut, ChevronRight, Ticket, Mail, Wallet, Copy, Check, Calendar, MapPin, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const DeliveryProgress = ({ status }: { status: string }) => (
    <View style={s.deliveryBox}>
        <View style={s.deliveryHeader}>
            <Text style={s.deliveryTitle}>Status do Envio</Text>
            <Text style={s.deliveryStatusEm}>Em trÃ¢nsito</Text>
        </View>
        <View style={s.deliveryBar}>
            <View style={[s.deliveryFill, { width: '50%' as any }]} />
        </View>
    </View>
);

const rarityColors: Record<string, string> = {
    comum: 'rgba(156,163,175,0.15)',
    raro: 'rgba(59,130,246,0.15)',
    epico: 'rgba(168,85,247,0.15)',
    lendario: 'rgba(234,179,8,0.15)',
    mitico: 'rgba(239,68,68,0.15)',
};

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [copiedWallet, setCopiedWallet] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    const { data: userRaffles = [], isLoading: isLoadingRaffles, refetch: refetchRaffles, isRefetching: isRefetchingRaffles } = useQuery({
        queryKey: ['user-raffles', user?.id],
        queryFn: () => user ? api.getUserRaffles(Number(user.id)).catch(() => []) : [],
        enabled: !!user,
    });

    const { data: ownedNFTs = [], isLoading: isLoadingNFTs, refetch: refetchNFTs, isRefetching: isRefetchingNFTs } = useQuery({
        queryKey: ['owned-nfts', user?.id],
        queryFn: () => user ? api.getWallet(Number(user.id)).catch(() => []) : [],
        enabled: !!user,
    });

    const isRefetching = isRefetchingRaffles || isRefetchingNFTs;
    const refetchAll = () => { refetchRaffles(); refetchNFTs(); };

    const handleLogout = () => {
        Alert.alert('Sair', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: signOut },
        ]);
    };

    const copyToClipboard = async (text: string, type: 'wallet' | 'id') => {
        await Clipboard.setStringAsync(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (type === 'wallet') { setCopiedWallet(true); setTimeout(() => setCopiedWallet(false), 2000); }
        if (type === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }
    };

    if (!user) return null;

    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
    const totalRaffles = userRaffles.length;
    const activeRaffles = userRaffles.filter((ur: any) => ur.raffle?.status === 'ativo' || ur.raffle?.status === 'active').length;
    const totalNFTs = ownedNFTs.reduce((sum: number, nft: any) => sum + (nft.quantidade || 0), 0);
    const wonRaffles = userRaffles.filter((ur: any) => ur.raffle?.winner_id && String(ur.raffle?.winner_id) === String(user.id));

    return (
        <ScreenWrapper style={s.root}>
            <StatusBar barStyle="light-content" />

            {/* Glass Header */}
            <View style={s.stickHeader}>
                <SafeAreaView edges={['top']} style={s.stickInner}>
                    <Text style={s.stickTitle}>Minha Conta</Text>
                    <TouchableOpacity onPress={handleLogout} style={s.stickLogoutBtn}>
                        <LogOut size={15} color="#ef4444" />
                        <Text style={s.stickLogoutTxt}>Sair</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} tintColor="#00FF8C" colors={['#00FF8C']} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* User Info Card â€” Glassmorphism */}
                <View style={s.userCard}>
                    <LinearGradient colors={['rgba(0,255,140,0.1)', 'transparent']} style={s.userBgGradient} />
                    <View style={s.userContent}>
                        <View style={s.avatarContainer}>
                            <Image source={{ uri: user.picture || 'https://placehold.co/120x120/111827/00FF8C?text=' + initial }} style={s.avatarImage} />
                        </View>
                        <View style={s.userInfoText}>
                            <Text style={s.userName}>{user.name || user.email.split('@')[0]}</Text>
                            <View style={s.userMetaRow}>
                                <Mail size={13} color="#6b7280" />
                                <Text style={s.userMetaText} numberOfLines={1}>{user.email}</Text>
                            </View>
                            {user.walletAddress && (
                                <View style={s.userMetaRow}>
                                    <Wallet size={13} color="#6b7280" />
                                    <Text style={s.userMetaTextMono}>
                                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                    </Text>
                                    <TouchableOpacity style={s.copyBtn} onPress={() => copyToClipboard(user.walletAddress!, 'wallet')}>
                                        {copiedWallet ? <Check size={12} color="#00FF8C" /> : <Copy size={12} color="#6b7280" />}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={s.gridStats}>
                    {[
                        { value: totalNFTs, label: 'NFTs' },
                        { value: totalRaffles, label: 'Sorteios' },
                        { value: activeRaffles, label: 'Ativos' },
                        { value: wonRaffles.length, label: 'PrÃªmios' },
                    ].map((stat, i) => (
                        <View key={i} style={s.gridStatBox}>
                            <Text style={s.gridStatValue}>{stat.value}</Text>
                            <Text style={s.gridStatLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Won Raffles */}
                {wonRaffles.length > 0 && (
                    <View style={s.sectionCardYellow}>
                        <View style={s.sectionHeader}>
                            <Trophy size={18} color="#eab308" />
                            <Text style={s.sectionTitleYellow}>Meus PrÃªmios</Text>
                        </View>
                        {wonRaffles.map((ur: any) => (
                            <View key={`won-${ur.raffle.id}`} style={s.wonCard}>
                                <View style={s.wonCardRow}>
                                    <Image source={{ uri: ur.raffle.imagem }} style={s.wonThumb} />
                                    <View style={s.wonInfo}>
                                        <Text style={s.wonTitle}>{ur.raffle.titulo}</Text>
                                        <Text style={s.wonSubtitle}>VocÃª ganhou este prÃªmio!</Text>
                                    </View>
                                </View>
                                <View style={s.addressBox}>
                                    <View style={s.addressHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <MapPin size={13} color="#00FF8C" />
                                            <Text style={s.addressTitle}>Entrega</Text>
                                        </View>
                                        <Text style={s.addressActionBtn}>Alterar</Text>
                                    </View>
                                    <Text style={s.addressTextMain}>{user.address || 'Av. Paulista, 1000'}</Text>
                                    <Text style={s.addressTextSub}>SÃ£o Paulo/SP - 01310-100</Text>
                                </View>
                                <DeliveryProgress status="shipped" />
                                <TouchableOpacity style={s.wonBtn} onPress={() => router.push(`/raffle/${ur.raffle.id}`)}>
                                    <Text style={s.wonBtnText}>Ver Detalhes do PrÃªmio</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* My Raffles */}
                <View style={s.sectionCard}>
                    <View style={s.sectionHeader}>
                        <Ticket size={18} color="#00FF8C" />
                        <Text style={s.sectionTitle}>Meus Sorteios</Text>
                    </View>
                    {userRaffles.length === 0 ? (
                        <View style={s.emptyState}>
                            <Trophy size={36} color="#374151" style={{ marginBottom: 12 }} />
                            <Text style={s.emptyText}>VocÃª ainda nÃ£o participa de nenhum sorteio.</Text>
                            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/')}>
                                <Text style={s.emptyBtnText}>Explorar Sorteios</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={s.listWrapper}>
                            {userRaffles.map((ur: any) => {
                                const isActive = ur.raffle.status === 'ativo' || ur.raffle.status === 'active';
                                const isWinner = !isActive && ur.raffle.winner_id && String(ur.raffle.winner_id) === String(user.id);
                                return (
                                    <TouchableOpacity key={ur.raffle.id} style={s.listItem} onPress={() => router.push(`/raffle/${ur.raffle.id}`)}>
                                        <Image source={{ uri: ur.raffle.imagem }} style={s.listThumb} />
                                        <View style={s.listInfo}>
                                            <Text style={s.listTitle} numberOfLines={1}>{ur.raffle.titulo}</Text>
                                            <View style={s.listMetaRow}>
                                                <Calendar size={11} color="#6b7280" />
                                                <Text style={s.listMetaText}>
                                                    Termina em {format(new Date(ur.raffle.dataFim || new Date()), 'dd/MM', { locale: ptBR })}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={s.listRight}>
                                            <View style={[s.badge, isActive ? s.badgeActive : s.badgeInactive]}>
                                                <Text style={[s.badgeText, isActive ? s.badgeTextActive : s.badgeTextInactive]}>
                                                    {isActive ? 'Ativo' : 'Finalizado'}
                                                </Text>
                                            </View>
                                            {isWinner && (
                                                <View style={[s.badge, s.badgeWon]}>
                                                    <Text style={s.badgeTextWon}>ðŸ† Ganhou</Text>
                                                </View>
                                            )}
                                            <Text style={s.listTicketsQty}>{ur.ticketsComprados} ticket{ur.ticketsComprados > 1 ? 's' : ''}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* My NFTs */}
                <View style={s.sectionCard}>
                    <View style={s.sectionHeader}>
                        <Text style={{ fontSize: 16 }}>ðŸŽ¨</Text>
                        <Text style={s.sectionTitle}>Meus NFTs</Text>
                    </View>
                    {ownedNFTs.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={{ fontSize: 36, marginBottom: 12 }}>ðŸ–¼ï¸</Text>
                            <Text style={s.emptyText}>VocÃª ainda nÃ£o possui nenhum NFT.</Text>
                            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/')}>
                                <Text style={s.emptyBtnText}>Comprar NFTs</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={s.nftGrid}>
                            {ownedNFTs.map((nft: any) => (
                                <View key={nft.id} style={s.nftCard}>
                                    <View style={[s.nftRarityBadge, { backgroundColor: rarityColors[nft.raridade] || rarityColors.comum }]}>
                                        <Text style={s.nftRarityText}>{nft.raridade || 'Comum'}</Text>
                                    </View>
                                    <View style={s.nftImageContainer}>
                                        {nft.image ? (
                                            <Image source={{ uri: nft.image }} style={s.nftImg} resizeMode="contain" />
                                        ) : (
                                            <Text style={s.nftEmoji}>{nft.emoji}</Text>
                                        )}
                                    </View>
                                    <Text style={s.nftName} numberOfLines={1}>{nft.nome}</Text>
                                    <View style={s.nftQtyBadge}>
                                        <Text style={s.nftQtyText}>x{nft.quantidade}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Settings */}
                <View style={s.sectionCard}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>ConfiguraÃ§Ãµes</Text>
                    </View>
                    <View style={s.settingsList}>
                        <View style={s.settingsItem}>
                            <View>
                                <Text style={s.settingsLabel}>ID do UsuÃ¡rio</Text>
                                <Text style={s.settingsValueMono}>{user.id.toString().slice(0, 8)}...</Text>
                            </View>
                            <TouchableOpacity style={s.settingsActionSquare} onPress={() => copyToClipboard(user.id.toString(), 'id')}>
                                {copiedId ? <Check size={14} color="#00FF8C" /> : <Copy size={14} color="#f9fafb" />}
                            </TouchableOpacity>
                        </View>
                        <View style={s.settingsItem}>
                            <View>
                                <Text style={s.settingsLabel}>Membro desde</Text>
                                <Text style={s.settingsValue}>Janeiro 2026</Text>
                            </View>
                            <View style={s.settingsIconWrap}>
                                <Calendar size={18} color="#6b7280" />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },

    // Header
    stickHeader: {
        backgroundColor: '#0A0B12',
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
        zIndex: 10,
    },
    stickInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
    stickTitle: { color: '#f9fafb', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    stickLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' },
    stickLogoutTxt: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

    // User Card
    userCard: {
        margin: 16,
        backgroundColor: '#111827',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1f2937',
        overflow: 'hidden',
    },
    userBgGradient: { height: 60, width: '100%' },
    userContent: { padding: 16, paddingTop: 0, flexDirection: 'row', gap: 14 },
    avatarContainer: {
        marginTop: -32,
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#00FF8C',
        backgroundColor: '#1f2937',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    userInfoText: { flex: 1, paddingTop: 8, gap: 5 },
    userName: { color: '#f9fafb', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
    userMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userMetaText: { color: '#6b7280', fontSize: 12, flex: 1 },
    userMetaTextMono: { color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    copyBtn: { padding: 4 },

    // Stats Grid
    gridStats: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 },
    gridStatBox: {
        flex: 1,
        backgroundColor: '#111827',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1f2937',
        paddingVertical: 14,
        alignItems: 'center',
        gap: 3,
    },
    gridStatValue: { color: '#00FF8C', fontSize: 22, fontWeight: '900' },
    gridStatLabel: { color: '#6b7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

    // Section Cards
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#111827',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#1f2937',
        overflow: 'hidden',
    },
    sectionCardYellow: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#111827',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(234, 179, 8, 0.25)',
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
    },
    sectionTitle: { color: '#f9fafb', fontSize: 16, fontWeight: '800' },
    sectionTitleYellow: { color: '#eab308', fontSize: 16, fontWeight: '800' },

    emptyState: { padding: 32, alignItems: 'center' },
    emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 16 },
    emptyBtn: { backgroundColor: '#00FF8C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    emptyBtnText: { color: '#0A0B12', fontSize: 13, fontWeight: '800' },

    // Won raffles
    wonCard: { padding: 16, gap: 14 },
    wonCardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    wonThumb: { width: 64, height: 64, borderRadius: 12 },
    wonInfo: { flex: 1, gap: 3 },
    wonTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '800' },
    wonSubtitle: { color: '#eab308', fontSize: 12, fontWeight: '600' },

    addressBox: { backgroundColor: '#0A0B12', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1f2937' },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    addressTitle: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
    addressActionBtn: { color: '#00FF8C', fontSize: 11, fontWeight: '700' },
    addressTextMain: { color: '#f9fafb', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    addressTextSub: { color: '#6b7280', fontSize: 11 },

    deliveryBox: { backgroundColor: '#0A0B12', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1f2937' },
    deliveryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    deliveryTitle: { color: '#6b7280', fontSize: 11, fontWeight: '600' },
    deliveryStatusEm: { color: '#f9fafb', fontSize: 11, fontWeight: '700' },
    deliveryBar: { height: 4, backgroundColor: '#1f2937', borderRadius: 2, overflow: 'hidden' },
    deliveryFill: { height: '100%', backgroundColor: '#00FF8C', borderRadius: 2 },

    wonBtn: { borderWidth: 1, borderColor: '#1f2937', backgroundColor: '#0A0B12', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    wonBtnText: { color: '#f9fafb', fontSize: 13, fontWeight: '700' },

    // Raffle list
    listWrapper: { padding: 12, gap: 8 },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#0A0B12',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    listThumb: { width: 54, height: 54, borderRadius: 10 },
    listInfo: { flex: 1, gap: 4 },
    listTitle: { color: '#f9fafb', fontSize: 14, fontWeight: '700' },
    listMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    listMetaText: { color: '#6b7280', fontSize: 11 },
    listRight: { alignItems: 'flex-end', gap: 5 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeActive: { backgroundColor: 'rgba(0,255,140,0.12)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.3)' },
    badgeInactive: { backgroundColor: '#1f2937' },
    badgeWon: { backgroundColor: '#eab308' },
    badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    badgeTextActive: { color: '#00FF8C' },
    badgeTextInactive: { color: '#9ca3af' },
    badgeTextWon: { color: '#0A0B12', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    listTicketsQty: { color: '#4b5563', fontSize: 11, fontWeight: '600' },

    // NFT grid in profile
    nftGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
    nftCard: {
        width: '47%',
        backgroundColor: '#0A0B12',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1f2937',
        alignItems: 'center',
    },
    nftRarityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    nftRarityText: { color: '#f9fafb', fontSize: 8, fontWeight: '800', textTransform: 'capitalize' },
    nftImageContainer: { height: 84, justifyContent: 'center', alignItems: 'center', marginBottom: 8, marginTop: 12 },
    nftImg: { width: 80, height: 80 },
    nftEmoji: { fontSize: 56 },
    nftName: { color: '#f9fafb', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    nftQtyBadge: { backgroundColor: 'rgba(0,255,140,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,255,140,0.2)' },
    nftQtyText: { color: '#00FF8C', fontSize: 11, fontWeight: '800' },

    // Settings
    settingsList: { padding: 12, gap: 8 },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0A0B12',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    settingsLabel: { color: '#f9fafb', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    settingsValue: { color: '#6b7280', fontSize: 12 },
    settingsValueMono: { color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    settingsActionSquare: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#1f2937',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIconWrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});

