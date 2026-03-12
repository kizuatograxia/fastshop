import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Alert, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ShieldCheck, Award, CalendarClock, Users, Gem, PlusCircle, MinusCircle, QrCode, Copy, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuth } from '../../components/providers/AuthProvider';
import { DecorativeBackground } from '../../components/DecorativeBackground';
import { RaffleHero } from '../../components/raffle/RaffleHero';
import { RaffleCheckoutBar } from '../../components/raffle/RaffleCheckoutBar';
import { SellerCard } from '../../components/raffle/SellerCard';
import { PurchaseActivity } from '../../components/raffle/PurchaseActivity';
import { theme } from '../../lib/theme';

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View style={s.infoRow}>
        {icon}
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
    </View>
);

export default function RaffleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // Checkout Modal States
    const [showModal, setShowModal] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<'nfts' | 'pix' | 'processing' | 'success'>('nfts');
    const [selectedNFTs, setSelectedNFTs] = useState<Record<string, number>>({});
    const [pixData, setPixData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const { data: raffle, isLoading } = useQuery({
        queryKey: ['raffle', id],
        queryFn: () => api.getRaffle(id).catch(() => null),
    });

    const { data: ownedNFTs = [] } = useQuery({
        queryKey: ['owned-nfts', user?.id],
        queryFn: () => user ? api.getWallet(Number(user.id)).catch(() => []) : [],
        enabled: !!user,
    });

    if (isLoading) {
        return (
            <View style={s.centered}>
                <DecorativeBackground />
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={s.loadingText}>Carregando sorteio...</Text>
            </View>
        );
    }

    if (!raffle) {
        return (
            <View style={s.centered}>
                <DecorativeBackground />
                <Text style={s.loadingText}>Sorteio não encontrado.</Text>
            </View>
        );
    }

    const progress = Math.min((raffle.participantes / raffle.maxParticipantes) * 100, 100);
    const custo = typeof raffle.custoNFT === 'number' ? raffle.custoNFT : 0;
    const imageUri = raffle.imagem || (raffle.image_urls && raffle.image_urls[0]) || 'https://placehold.co/600x400/111827/00FF8C';
    const rawDate = raffle.dataFim;
    const endDate = rawDate ? new Date(rawDate) : null;
    const isValidDate = endDate && !isNaN(endDate.getTime());
    const currentChance = raffle.maxParticipantes > 0
        ? ((1 / (raffle.maxParticipantes - raffle.participantes || 1)) * 100).toFixed(2)
        : '0';

    const finalPrice = Math.max(0, (custo * quantity) -
        Object.entries(selectedNFTs).reduce((acc, [nftId, qty]: [string, any]) => {
            const nft = ownedNFTs.find((n: any) => n.id === nftId);
            return acc + (nft ? Math.min(custo, (nft.preco || 0)) * qty : 0);
        }, 0)
    );

    const handleOpenCheckout = () => {
        if (!user) {
            Alert.alert('Login necessário', 'Entre na sua conta para participar.');
            return;
        }
        setSelectedNFTs({});
        setPixData(null);
        setCheckoutStep('nfts');
        setShowModal(true);
    };

    const handleConfirmNFTs = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (finalPrice > 0) {
            setCheckoutStep('processing');
            try {
                const data = await api.createPayment(user!.id, finalPrice, [{ id: 'raffle_entry', quantity }]);
                setPixData({
                    qrCode: data.qrCodeBase64 ? `data:image/png;base64,${data.qrCodeBase64}` : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode)}`,
                    copyPasteCode: data.copyPaste,
                    transactionId: data.transactionId,
                });
                setCheckoutStep('pix');
            } catch (error: any) {
                Alert.alert("Erro no Pagamento", error.message || "Não foi possível gerar o PIX.");
                setCheckoutStep('nfts');
            }
        } else {
            executeJoin();
        }
    };

    const executeJoin = async () => {
        setCheckoutStep('processing');
        try {
            await api.joinRaffle(Number(id), Number(user!.id), selectedNFTs, quantity);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setCheckoutStep('success');
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', err.message || 'Não foi possível participar.');
            setCheckoutStep('nfts');
        }
    };

    const handleCopy = async () => {
        if (pixData) {
            await Clipboard.setStringAsync(pixData.copyPasteCode);
            setCopied(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <DecorativeBackground />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <RaffleHero imageUri={imageUri} onBack={() => router.back()} />

                <View style={s.content}>
                    <View style={s.headerSection}>
                        <View style={s.statusRow}>
                            <View style={[s.statusBadge, raffle.status !== 'ativo' && s.statusInactive]}>
                                <View style={[s.statusDot, raffle.status !== 'ativo' && { backgroundColor: '#6b7280' }]} />
                                <Text style={[s.statusText, raffle.status !== 'ativo' && { color: '#6b7280' }]}>
                                    {raffle.status === 'ativo' ? 'SORTEIO ATIVO' : 'ENCERRADO'}
                                </Text>
                            </View>
                            <View style={s.participantsRow}>
                                <Users size={12} color={theme.colors.mutedForeground} />
                                <Text style={s.soldCount}>{raffle.participantes} participantes</Text>
                            </View>
                        </View>

                        <Text style={s.title}>{raffle.titulo}</Text>
                        <View style={s.prizeContainer}>
                            <Text style={s.prizeLabel}>{raffle.premio}</Text>
                            <LinearGradient
                                colors={theme.gradients.primary as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.prizeGlow}
                            />
                        </View>
                    </View>

                    <View style={s.mainProgressSection}>
                        <View style={s.progressLabels}>
                            <Text style={s.progressPrimaryLab}>Progresso da Alocação</Text>
                            <Text style={s.progressPerc}>{Math.round(progress)}%</Text>
                        </View>
                        <View style={s.mainProgressBarBg}>
                            <LinearGradient
                                colors={theme.gradients.primary as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[s.mainProgressBarFill, { width: `${progress}%` }]}
                            />
                        </View>
                        <View style={s.participantsSub}>
                            <Text style={s.particSubText}>
                                Faltam <Text style={s.particHighlight}>{raffle.maxParticipantes - raffle.participantes}</Text> cotas para o sorteio
                            </Text>
                        </View>
                    </View>

                    <SellerCard />

                    <View style={s.statsGrid}>
                        <View style={s.statCard}>
                            <Text style={s.statCardLab}>PREÇO POR COTA</Text>
                            <Text style={s.statCardVal}>R$ {custo.toFixed(2)}</Text>
                        </View>
                        <View style={s.statCard}>
                            <Text style={s.statCardLab}>SUA CHANCE</Text>
                            <Text style={s.statCardVal}>{currentChance}%</Text>
                        </View>
                    </View>

                    <PurchaseActivity />

                    <View style={s.infoCard}>
                        <Text style={s.sectionTitle}>Informações</Text>
                        <InfoRow 
                            icon={<Award size={14} color={theme.colors.primary} />} 
                            label="Prêmio Total" 
                            value={`R$ ${raffle.premioValor?.toLocaleString('pt-BR') ?? '—'}`} 
                        />
                        <InfoRow
                            icon={<CalendarClock size={14} color={theme.colors.primary} />}
                            label="Encerramento"
                            value={isValidDate ? format(endDate!, "dd 'de' MMMM, yyyy", { locale: ptBR }) : '—'}
                        />
                    </View>

                    {raffle.descricao && (
                        <View style={s.descCard}>
                            <Text style={s.sectionTitle}>Sobre o Sorteio</Text>
                            <Text style={s.descText} numberOfLines={isDescExpanded ? undefined : 4}>
                                {raffle.descricao}
                            </Text>
                            {raffle.descricao.length > 120 && (
                                <Text
                                    style={s.readMore}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setIsDescExpanded(!isDescExpanded);
                                    }}
                                >
                                    {isDescExpanded ? 'Ver menos' : 'Ver mais'}
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={s.guaranteeCard}>
                        <ShieldCheck size={20} color={theme.colors.primary} />
                        <Text style={s.guaranteeText}>
                            Compra Garantida — receba o bilhete verificado ou devolvemos suas NFTs.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <RaffleCheckoutBar
                quantity={quantity}
                setQuantity={setQuantity}
                custo={custo}
                joining={checkoutStep === 'processing'}
                onJoin={handleOpenCheckout}
            />

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Finalizar Participação</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={s.modalClose}>
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {checkoutStep === 'nfts' && (
                            <ScrollView style={{ maxHeight: 400 }}>
                                <View style={s.modalBody}>
                                    <Text style={s.modalSub}>Sua compra: {quantity} cota(s) — R$ {(custo * quantity).toFixed(2)}</Text>

                                    {ownedNFTs.length > 0 ? (
                                        <>
                                            <View style={s.nftSelectionHeader}>
                                                <Gem size={18} color={theme.colors.primary} />
                                                <Text style={s.sectionTitle}>Usar Meus NFTs para Desconto</Text>
                                            </View>
                                            <View style={s.modalGrid}>
                                                {ownedNFTs.map((nft: any) => {
                                                    const available = nft.quantidade || 1;
                                                    const selected = selectedNFTs[nft.id] || 0;
                                                    const isSelected = selected > 0;
                                                    return (
                                                        <TouchableOpacity
                                                            key={nft.id}
                                                            style={[s.modalNftCard, isSelected && s.modalNftCardActive]}
                                                            onPress={() => {
                                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                                setSelectedNFTs((prev) => {
                                                                    const next = { ...prev };
                                                                    if (next[nft.id] && next[nft.id] >= available) {
                                                                        delete next[nft.id];
                                                                    } else {
                                                                        next[nft.id] = (next[nft.id] || 0) + 1;
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                        >
                                                            <View style={s.nftPickImgWrap}>
                                                                {nft.image ? <Image source={{ uri: nft.image }} style={{ width: 32, height: 32 }} /> : <Text style={{ fontSize: 24 }}>{nft.emoji}</Text>}
                                                            </View>
                                                            <Text style={s.modalNftName} numberOfLines={1}>{nft.nome}</Text>
                                                            <Text style={s.modalNftAvailable}>Disp: {available}</Text>
                                                            {isSelected && (
                                                                <View style={s.modalNftBadge}>
                                                                    <Text style={s.modalNftBadgeText}>{selected}x</Text>
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </>
                                    ) : (
                                        <View style={s.emptyWallet}>
                                            <Text style={s.emptyWalletText}>Sua carteira de NFTs está vazia.</Text>
                                        </View>
                                    )}

                                    <View style={s.modalFooter}>
                                        <View style={s.modalTotalRow}>
                                            <Text style={s.modalTotalLabel}>Total a Pagar</Text>
                                            <Text style={s.modalTotalValue}>R$ {finalPrice.toFixed(2)}</Text>
                                        </View>
                                        <TouchableOpacity style={s.modalBtn} onPress={handleConfirmNFTs}>
                                            <Text style={s.modalBtnText}>{finalPrice > 0 ? 'Gerar PIX' : 'Concluir Resgate'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        )}

                        {checkoutStep === 'processing' && (
                            <View style={s.processingView}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={s.processingText}>Processando...</Text>
                            </View>
                        )}

                        {checkoutStep === 'pix' && pixData && (
                            <View style={s.pixSection}>
                                <View style={s.pixHeader}>
                                    <QrCode size={24} color={theme.colors.primary} />
                                    <Text style={s.modalTitle}>Pague via PIX</Text>
                                </View>
                                <View style={s.qrWrapper}>
                                    <Image source={{ uri: pixData.qrCode }} style={s.qrImage} />
                                </View>
                                <View style={s.copySection}>
                                    <Text style={s.copyLabel}>Copia e Cola</Text>
                                    <View style={s.copyRow}>
                                        <Text style={s.copyText} numberOfLines={1}>{pixData.copyPasteCode}</Text>
                                        <TouchableOpacity onPress={handleCopy} style={s.copyBtn}>
                                            {copied ? <Check size={20} color={theme.colors.primary} /> : <Copy size={20} color="#f9fafb" />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity style={s.simulateBtn} onPress={executeJoin}>
                                    <Text style={s.simulateText}>Simular Pagamento Confirmado</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {checkoutStep === 'success' && (
                            <View style={s.successView}>
                                <View style={s.successIconWrap}>
                                    <Check size={40} color="#0A0B12" />
                                </View>
                                <Text style={s.successTitle}>Sucesso!</Text>
                                <Text style={s.successSub}>Você está concorrendo a {quantity} cota(s).</Text>
                                <TouchableOpacity style={s.modalBtn} onPress={() => { setShowModal(false); router.replace('/(tabs)/profile'); }}>
                                    <Text style={s.modalBtnText}>Ver Meus Sorteios</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0A0B12' },
    centered: { flex: 1, backgroundColor: '#0A0B12', alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: '#6b7280', fontSize: 14 },
    content: { paddingHorizontal: 16, marginTop: -40 },
    headerSection: { marginBottom: 24 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.3)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    },
    statusInactive: { backgroundColor: 'rgba(107,114,128,0.1)', borderColor: 'rgba(107,114,128,0.3)' },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
    statusText: { color: theme.colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    soldCount: { color: '#6b7280', fontSize: 12 },
    participantsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    title: { color: theme.colors.foreground, fontSize: 26, fontWeight: '900', lineHeight: 32, marginBottom: 8 },
    prizeLabel: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
    prizeContainer: { marginTop: 4, position: 'relative' },
    prizeGlow: { position: 'absolute', bottom: -2, left: 0, height: 1, width: 100, opacity: 0.5 },
    mainProgressSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 20,
    },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
    progressPrimaryLab: { color: theme.colors.foreground, fontSize: 16, fontWeight: '700' },
    progressPerc: { color: theme.colors.primary, fontSize: 20, fontWeight: '900' },
    mainProgressBarBg: { height: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
    mainProgressBarFill: { height: '100%', borderRadius: 5 },
    participantsSub: { flexDirection: 'row' },
    particSubText: { color: theme.colors.mutedForeground, fontSize: 13 },
    particHighlight: { color: theme.colors.foreground, fontWeight: '700' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    statCardLab: { color: theme.colors.mutedForeground, fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
    statCardVal: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800' },
    sectionTitle: { color: theme.colors.foreground, fontSize: 15, fontWeight: '700', marginBottom: 12 },
    infoCard: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
    infoLabel: { color: theme.colors.mutedForeground, fontSize: 13, flex: 1 },
    infoValue: { color: theme.colors.foreground, fontSize: 13, fontWeight: '600' },
    descCard: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    descText: { color: theme.colors.mutedForeground, fontSize: 14, lineHeight: 22 },
    readMore: { color: theme.colors.primary, fontSize: 13, fontWeight: '700', marginTop: 8 },
    guaranteeCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,255,140,0.06)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(0,255,140,0.15)', marginBottom: 20 },
    guaranteeText: { color: theme.colors.mutedForeground, fontSize: 13, flex: 1, lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderWidth: 1, borderColor: '#1f2937' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '800' },
    modalClose: { padding: 4, backgroundColor: '#1f2937', borderRadius: 20 },
    modalBody: { gap: 16 },
    modalSub: { color: '#9ca3af', fontSize: 14, marginBottom: 8 },
    nftSelectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 4 },
    modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    modalNftCard: { width: '31%', backgroundColor: 'rgba(31,41,55,0.4)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    modalNftCardActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(0,255,140,0.05)' },
    nftPickImgWrap: { height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    modalNftName: { color: '#f9fafb', fontSize: 11, fontWeight: '700', textAlign: 'center' },
    modalNftAvailable: { color: '#6b7280', fontSize: 9, marginTop: 4 },
    modalNftBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.primary, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    modalNftBadgeText: { color: '#0A0B12', fontSize: 10, fontWeight: '900' },
    emptyWallet: { padding: 20, backgroundColor: 'rgba(31,41,55,0.3)', borderRadius: 12, alignItems: 'center' },
    emptyWalletText: { color: '#6b7280', fontSize: 13 },
    modalFooter: { borderTopWidth: 1, borderTopColor: '#1f2937', paddingTop: 16, marginTop: 10 },
    modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTotalLabel: { color: '#f9fafb', fontSize: 14, fontWeight: '700' },
    modalTotalValue: { color: theme.colors.primary, fontSize: 24, fontWeight: '900' },
    modalBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    modalBtnText: { color: '#0A0B12', fontSize: 16, fontWeight: '800' },
    processingView: { paddingVertical: 40, alignItems: 'center', gap: 16 },
    processingText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
    successView: { paddingVertical: 20, alignItems: 'center', gap: 12 },
    successIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    successTitle: { color: '#f9fafb', fontSize: 24, fontWeight: '800' },
    successSub: { color: '#9ca3af', fontSize: 14, marginBottom: 20 },
    pixSection: { paddingVertical: 10 },
    pixHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    qrWrapper: { backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
    qrImage: { width: 180, height: 180 },
    copySection: { marginBottom: 24 },
    copyLabel: { color: '#6b7280', fontSize: 12, marginBottom: 8 },
    copyRow: { flexDirection: 'row', backgroundColor: '#0A0B12', borderRadius: 12, padding: 10, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#1f2937' },
    copyText: { flex: 1, color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    copyBtn: { padding: 8, backgroundColor: '#1f2937', borderRadius: 8 },
    simulateBtn: { borderStyle: 'dotted', borderWidth: 1, borderColor: '#4b5563', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    simulateText: { color: '#f9fafb', fontSize: 13, fontWeight: '700' },
});
