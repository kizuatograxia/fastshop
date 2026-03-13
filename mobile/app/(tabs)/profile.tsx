import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, StatusBar, Alert, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { api } from '../../lib/api';
import { User, Trophy, LogOut, Ticket, Mail, Wallet, Copy, Check, Calendar, MapPin, Package, Truck, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../../lib/theme';
import { Image } from 'expo-image';
import { AddressModal } from '../../components/profile/AddressModal';

const DeliveryProgress = ({ status }: { status: string }) => {
    const steps = [
        { key: 'preparing', icon: Package, label: 'Preparando' },
        { key: 'shipped', icon: Truck, label: 'Enviado' },
        { key: 'in_transit', icon: Truck, label: 'Em trânsito' },
        { key: 'delivered', icon: CheckCircle2, label: 'Entregue' },
    ];

    const statusMap: Record<string, string> = {
        'pending': 'preparing',
        'preparing': 'preparing',
        'shipped': 'shipped',
        'in_transit': 'in_transit',
        'delivered': 'delivered'
    };

    const normalizedStatus = statusMap[status] || 'preparing';
    const currentStepIndex = steps.findIndex(s => s.key === normalizedStatus);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <View style={s.deliveryBox}>
            <View style={s.deliveryHeader}>
                <Text style={s.deliveryTitle}>Status do Envio</Text>
                <Text style={s.deliveryStatusEm}>
                    {steps[currentStepIndex]?.label || 'Aguardando'}
                </Text>
            </View>
            <View style={s.deliveryBar}>
                <View style={[s.deliveryFill, { width: `${progress}%` as any }]} />
            </View>
            <View style={s.deliveryIcons}>
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx <= currentStepIndex;
                    return (
                        <View key={step.key} style={s.deliveryIconWrap}>
                            <Icon size={14} color={isActive ? theme.colors.primary : theme.colors.muted} />
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [copiedWallet, setCopiedWallet] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

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

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Janeiro 2026'; // Fallback
        const date = new Date(dateString);
        return isValid(date) ? format(date, "MMMM yyyy", { locale: ptBR }) : 'Janeiro 2026';
    };

    if (!user) return null;

    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
    const totalNFTs = ownedNFTs.reduce((sum: number, nft: any) => sum + (nft.quantidade || 0), 0);
    const wonRaffles = userRaffles.filter((ur: any) => ur.raffle?.winner_id && String(ur.raffle?.winner_id) === String(user.id));
    const activeRaffles = userRaffles.filter((ur: any) => ur.raffle?.status === 'ativo').length;

    return (
        <ScreenWrapper style={s.root}>
            <StatusBar barStyle="light-content" />

            <View style={s.stickHeader}>
                <SafeAreaView edges={['top']} style={s.stickInner}>
                    <Text style={s.stickTitle}>Minha Conta</Text>
                    <TouchableOpacity onPress={handleLogout} style={s.stickLogoutBtn}>
                        <LogOut size={15} color={theme.colors.destructive} />
                        <Text style={s.stickLogoutTxt}>Sair</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* User Info Card */}
                <View style={s.userCard}>
                    <LinearGradient colors={['rgba(0,255,140,0.1)', 'transparent']} style={s.userBgGradient} />
                    <View style={s.userContent}>
                        <View style={s.avatarContainer}>
                            <Image source={user.picture || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=111827&color=00FF8C`} style={s.avatarImage} />
                        </View>
                        <View style={s.userInfoText}>
                            <Text style={s.userName}>{user.name || user.email.split('@')[0]}</Text>
                            <View style={s.userMetaRow}>
                                <Mail size={13} color={theme.colors.mutedForeground} />
                                <Text style={s.userMetaText} numberOfLines={1}>{user.email}</Text>
                            </View>
                            {user.walletAddress && (
                                <View style={s.userMetaRow}>
                                    <Wallet size={13} color={theme.colors.mutedForeground} />
                                    <Text style={s.userMetaTextMono}>
                                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                    </Text>
                                    <TouchableOpacity style={s.copyBtn} onPress={() => copyToClipboard(user.walletAddress!, 'wallet')}>
                                        {copiedWallet ? <Check size={12} color={theme.colors.primary} /> : <Copy size={12} color={theme.colors.mutedForeground} />}
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
                        { value: userRaffles.length, label: 'Sorteios' },
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
                                    <Image source={ur.raffle.imagem} style={s.wonThumb} contentFit="cover" />
                                    <View style={s.wonInfo}>
                                        <Text style={s.wonTitle}>{ur.raffle.titulo}</Text>
                                        <Text style={s.wonSubtitle}>Você ganhou este prêmio!</Text>
                                    </View>
                                </View>
                                <View style={s.addressBox}>
                                    <View style={s.addressHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <MapPin size={13} color={theme.colors.primary} />
                                            <Text style={s.addressTitle}>Endereço de Entrega</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                                            <Text style={s.addressActionBtn}>Alterar</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={s.addressTextMain}>{user.address || 'Não cadastrado'}</Text>
                                    {ur.raffle.trackingCode && (
                                        <Text style={s.trackingText}>Rastreio: {ur.raffle.trackingCode} ({ur.raffle.carrier})</Text>
                                    )}
                                </View>
                                <DeliveryProgress status={ur.raffle.shippingStatus || 'pending'} />
                            </View>
                        ))}
                    </View>
                )}

                {/* My Raffles */}
                <View style={s.sectionCard}>
                    <View style={s.sectionHeader}>
                        <Ticket size={18} color={theme.colors.primary} />
                        <Text style={s.sectionTitle}>Sorteios que Participo</Text>
                    </View>
                    {userRaffles.length === 0 ? (
                        <View style={s.emptyState}>
                            <Trophy size={36} color={theme.colors.muted} style={{ marginBottom: 12 }} />
                            <Text style={s.emptyText}>Você ainda não participa de nenhum sorteio.</Text>
                            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/')}>
                                <Text style={s.emptyBtnText}>Explorar Sorteios</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={s.listWrapper}>
                            {userRaffles.map((ur: any) => {
                                const isActive = ur.raffle.status === 'ativo';
                                const isWinner = String(ur.raffle.winner_id) === String(user.id);
                                return (
                                    <TouchableOpacity key={ur.raffle.id} style={s.listItem} onPress={() => router.push(`/raffle/${ur.raffle.id}`)}>
                                        <Image source={ur.raffle.imagem} style={s.listThumb} contentFit="cover" />
                                        <View style={s.listInfo}>
                                            <Text style={s.listTitle} numberOfLines={1}>{ur.raffle.titulo}</Text>
                                            <View style={s.listMetaRow}>
                                                <Calendar size={11} color={theme.colors.mutedForeground} />
                                                <Text style={s.listMetaText}>
                                                    Tickets: {ur.ticketsComprados}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={s.listRight}>
                                            <View style={[s.badge, isActive ? s.badgeActive : s.badgeInactive]}>
                                                <Text style={[s.badgeText, isActive ? s.badgeTextActive : s.badgeTextInactive]}>
                                                    {isActive ? 'Ativo' : 'Encerrado'}
                                                </Text>
                                            </View>
                                            {isWinner && (
                                                <View style={[s.badge, s.badgeWon]}>
                                                    <Text style={s.badgeTextWon}>🏆 Vencedor</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Settings */}
                <View style={s.sectionCard}>
                    <View style={s.sectionHeader}>
                        <User size={18} color={theme.colors.primary} />
                        <Text style={s.sectionTitle}>Informações da Conta</Text>
                    </View>
                    <View style={s.settingsList}>
                        <View style={s.settingsItem}>
                            <View>
                                <Text style={s.settingsLabel}>Número de Loto</Text>
                                <Text style={s.settingsValueMono}>#LP-{user.id.toString().slice(-6).toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity style={s.settingsActionSquare} onPress={() => copyToClipboard(user.id.toString(), 'id')}>
                                {copiedId ? <Check size={14} color={theme.colors.primary} /> : <Copy size={14} color={theme.colors.foreground} />}
                            </TouchableOpacity>
                        </View>
                        <View style={s.settingsItem}>
                            <View>
                                <Text style={s.settingsLabel}>Membro desde</Text>
                                <Text style={s.settingsValue}>{formatDate(user.createdAt)}</Text>
                            </View>
                            <View style={s.settingsIconWrap}>
                                <Calendar size={18} color={theme.colors.mutedForeground} />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <AddressModal 
                visible={addressModalVisible} 
                onClose={() => setAddressModalVisible(false)}
                onSuccess={() => refetchAll()}
            />
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    stickHeader: {
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    stickInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
    stickTitle: { color: theme.colors.foreground, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    stickLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    stickLogoutTxt: { color: theme.colors.destructive, fontSize: 13, fontWeight: '700' },

    userCard: { margin: 16, backgroundColor: theme.colors.card, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
    userBgGradient: { height: 60, width: '100%' },
    userContent: { padding: 20, paddingTop: 0, flexDirection: 'row', gap: 16 },
    avatarContainer: { marginTop: -32, width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: theme.colors.primary, backgroundColor: theme.colors.accent, overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    userInfoText: { flex: 1, paddingTop: 12, gap: 6 },
    userName: { color: theme.colors.foreground, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    userMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    userMetaText: { color: theme.colors.mutedForeground, fontSize: 13, flex: 1 },
    userMetaTextMono: { color: theme.colors.mutedForeground, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    copyBtn: { padding: 4 },

    gridStats: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 10 },
    gridStatBox: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingVertical: 16, alignItems: 'center', gap: 4 },
    gridStatValue: { color: theme.colors.primary, fontSize: 22, fontWeight: '900' },
    gridStatLabel: { color: theme.colors.mutedForeground, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    sectionCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
    sectionCardYellow: { marginHorizontal: 16, marginBottom: 16, backgroundColor: theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.3)', overflow: 'hidden' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    sectionTitle: { color: theme.colors.foreground, fontSize: 16, fontWeight: '800' },
    sectionTitleYellow: { color: '#eab308', fontSize: 16, fontWeight: '800' },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: theme.colors.mutedForeground, fontSize: 14, textAlign: 'center', marginBottom: 20 },
    emptyBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { color: theme.colors.primaryForeground, fontSize: 14, fontWeight: '800' },

    wonCard: { padding: 16, gap: 16 },
    wonCardRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
    wonThumb: { width: 70, height: 70, borderRadius: 14 },
    wonInfo: { flex: 1, gap: 4 },
    wonTitle: { color: theme.colors.foreground, fontSize: 16, fontWeight: '800' },
    wonSubtitle: { color: '#eab308', fontSize: 12, fontWeight: '700' },

    addressBox: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addressTitle: { color: theme.colors.foreground, fontSize: 13, fontWeight: '700' },
    addressActionBtn: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
    addressTextMain: { color: theme.colors.mutedForeground, fontSize: 13, lineHeight: 18 },
    trackingText: { color: theme.colors.primary, fontSize: 11, fontWeight: '700', marginTop: 8 },

    deliveryBox: { marginTop: 4 },
    deliveryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    deliveryTitle: { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600' },
    deliveryStatusEm: { color: theme.colors.foreground, fontSize: 12, fontWeight: '800' },
    deliveryBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    deliveryFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
    deliveryIcons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
    deliveryIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center' },

    listWrapper: { padding: 12, gap: 10 },
    listItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    listThumb: { width: 56, height: 56, borderRadius: 12 },
    listInfo: { flex: 1, gap: 6 },
    listTitle: { color: theme.colors.foreground, fontSize: 15, fontWeight: '700' },
    listMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    listMetaText: { color: theme.colors.mutedForeground, fontSize: 12 },
    listRight: { alignItems: 'flex-end', gap: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeActive: { backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.2)' },
    badgeInactive: { backgroundColor: 'rgba(255,255,255,0.05)' },
    badgeWon: { backgroundColor: '#eab308' },
    badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    badgeTextActive: { color: theme.colors.primary },
    badgeTextInactive: { color: theme.colors.mutedForeground },
    badgeTextWon: { color: '#000', fontSize: 10, fontWeight: '900' },

    settingsList: { padding: 12, gap: 10 },
    settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    settingsLabel: { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600', marginBottom: 4 },
    settingsValue: { color: theme.colors.foreground, fontSize: 14, fontWeight: '700' },
    settingsValueMono: { color: theme.colors.foreground, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    settingsActionSquare: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    settingsIconWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
