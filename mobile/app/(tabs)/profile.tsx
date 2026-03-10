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
            <Text style={s.deliveryStatusEm}>Em trânsito</Text>
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
                {/* User Info Card — Glassmorphism */}
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
                        { value: wonRaffles.length, label: 'Prêmios' },
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
                            <Text style={s.sectionTitleYellow}>Meus Prêmios</Text>
                        </View>
                        {wonRaffles.map((ur: any) => (
                            <View key={`won-${ur.raffle.id}`} style={s.wonCard}>
                                <View style={s.wonCardRow}>
                                    <Image source={{ uri: ur.raffle.imagem }} style={s.wonThumb} />
                                    <View style={s.wonInfo}>
                                        <Text style={s.wonTitle}>{ur.raffle.titulo}</Text>
                                        <Text style={s.wonSubtitle}>Você ganhou este prêmio!</Text>
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
                                    <Text style={s.addressTextSub}>São Paulo/SP - 01310-100</Text>
                                </View>
                                <DeliveryProgress status="shipped" />
                                <TouchableOpacity style={s.wonBtn} onPress={() => router.push(`/raffle/${ur.raffle.id}`)}>
                                    <Text style={s.wonBtnText}>Ver Detalhes do Prêmio</Text>
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
                            <Text style={s.emptyText}>Você ainda não participa de nenhum sorteio.</Text>
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
                                                    <Text style={s.badgeTextWon}>🏆 Ganhou</Text>
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
                        <Text style={{ fontSize: 16 }}>🎨</Text>
                        <Text style={s.sectionTitle}>Meus NFTs</Text>
                    </View>
                    {ownedNFTs.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={{ fontSize: 36, marginBottom: 12 }}>🖼️</Text>
                            <Text style={s.emptyText}>Você ainda não possui nenhum NFT.</Text>
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
                        <Text style={s.sectionTitle}>Configurações</Text>
                    </View>
                    <View style={s.settingsList}>
                        <View style={s.settingsItem}>
                            <View>
                                <Text style={s.settingsLabel}>ID do Usuário</Text>
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

    // Header — glass effect
    stickHeader: {
        backgroundColor: 'rgba(10, 11, 18, 0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(31, 41, 55, 0.5)',
        zIndex: 10,
    },
    stickInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
    stickTitle: { color: '#f9fafb', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    stickLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    stickLogoutTxt: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

    // User Card — glass
    userCard: {
        margin: 16,
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.6)',
        overflow: 'hidden',
    },
    userBgGradient: { height: 50, width: '100%' },
    userContent: { padding: 16, paddingTop: 0, flexDirection: 'row', gap: 14 },
    avatarContainer: { marginTop: -28, width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(17, 24, 39, 0.8)', backgroundColor: '#1f2937', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    userInfoText: { flex: 1, paddingTop: 6, gap: 4 },
    userName: { color: '#f9fafb', fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
    userMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userMetaText: { color: '#6b7280', fontSize: 12, flex: 1 },
    userMetaTextMono: { color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    copyBtn: { padding: 4 },

    // Stats
    gridStats: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 },
    gridStatBox: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.5)',
        paddingVertical: 12,
        alignItems: 'center',
        gap: 2,
    },
    gridStatValue: { color: '#00FF8C', fontSize: 20, fontWeight: '800' },
    gridStatLabel: { color: '#6b7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Sections — glass cards
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.5)',
        overflow: 'hidden',
    },
    sectionCardYellow: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(234, 179, 8, 0.04)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(234, 179, 8, 0.2)',
        overflow: 'hidden',
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(31, 41, 55, 0.4)' },
    sectionTitle: { color: '#f9fafb', fontSize: 16, fontWeight: '800' },
    sectionTitleYellow: { color: '#eab308', fontSize: 16, fontWeight: '800' },

    emptyState: { padding: 28, alignItems: 'center' },
    emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 14 },
    emptyBtn: { backgroundColor: '#00FF8C', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
    emptyBtnText: { color: '#0A0B12', fontSize: 13, fontWeight: '700' },

    wonCard: { padding: 16, gap: 14 },
    wonCardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    wonThumb: { width: 64, height: 64, borderRadius: 10 },
    wonInfo: { flex: 1, gap: 3 },
    wonTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '800' },
    wonSubtitle: { color: '#eab308', fontSize: 12, fontWeight: '600' },

    addressBox: { backgroundColor: 'rgba(10, 11, 18, 0.3)', borderRadius: 10, padding: 12 },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    addressTitle: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
    addressActionBtn: { color: '#00FF8C', fontSize: 11, fontWeight: '600' },
    addressTextMain: { color: '#f9fafb', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    addressTextSub: { color: '#6b7280', fontSize: 11 },

    deliveryBox: { backgroundColor: 'rgba(10, 11, 18, 0.3)', borderRadius: 10, padding: 12 },
    deliveryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    deliveryTitle: { color: '#6b7280', fontSize: 11 },
    deliveryStatusEm: { color: '#f9fafb', fontSize: 11, fontWeight: '700' },
    deliveryBar: { height: 3, backgroundColor: '#1f2937', borderRadius: 2, overflow: 'hidden' },
    deliveryFill: { height: '100%', backgroundColor: '#00FF8C', borderRadius: 2 },

    wonBtn: { borderWidth: 1, borderColor: 'rgba(55, 65, 81, 0.5)', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
    wonBtnText: { color: '#f9fafb', fontSize: 13, fontWeight: '600' },

    listWrapper: { padding: 14, gap: 10 },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(10, 11, 18, 0.3)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.4)',
    },
    listThumb: { width: 52, height: 52, borderRadius: 8 },
    listInfo: { flex: 1, gap: 3 },
    listTitle: { color: '#f9fafb', fontSize: 14, fontWeight: '700' },
    listMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    listMetaText: { color: '#6b7280', fontSize: 11 },
    listRight: { alignItems: 'flex-end', gap: 4 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeActive: { backgroundColor: '#00FF8C' },
    badgeInactive: { backgroundColor: '#374151' },
    badgeWon: { backgroundColor: '#eab308' },
    badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    badgeTextActive: { color: '#0A0B12' },
    badgeTextInactive: { color: '#f9fafb' },
    badgeTextWon: { color: '#0A0B12', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    listTicketsQty: { color: '#6b7280', fontSize: 11 },

    nftGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
    nftCard: {
        width: '47%',
        backgroundColor: 'rgba(10, 11, 18, 0.3)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.4)',
        alignItems: 'center',
    },
    nftRarityBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    nftRarityText: { color: '#f9fafb', fontSize: 8, fontWeight: '800', textTransform: 'capitalize' },
    nftImageContainer: { height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 8, marginTop: 10 },
    nftImg: { width: 44, height: 44 },
    nftEmoji: { fontSize: 36 },
    nftName: { color: '#f9fafb', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
    nftQtyBadge: { backgroundColor: 'rgba(31, 41, 55, 0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    nftQtyText: { color: '#6b7280', fontSize: 10, fontWeight: '700' },

    settingsList: { padding: 14, gap: 10 },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(10, 11, 18, 0.3)',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 0.4)',
    },
    settingsLabel: { color: '#f9fafb', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    settingsValue: { color: '#6b7280', fontSize: 12 },
    settingsValueMono: { color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    settingsActionSquare: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(55, 65, 81, 0.5)', alignItems: 'center', justifyContent: 'center' },
    settingsIconWrap: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
