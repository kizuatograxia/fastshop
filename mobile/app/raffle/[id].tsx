import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Alert, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ShieldCheck, Award, CalendarClock, Users, Gem, QrCode, Copy, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, Ticket as TicketIcon, Truck as TruckIcon, Plus, Minus } from 'lucide-react-native';

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
    const [activeImage, setActiveImage] = useState('');

    const { data: raffle, isLoading } = useQuery({
        queryKey: ['raffle', id],
        queryFn: () => api.getRaffle(id).catch(() => null),
    });

    const { data: participants = [] } = useQuery({
        queryKey: ['raffle-participants', id],
        queryFn: () => api.getRaffleParticipants(id).catch(() => []),
    });
    const { data: ownedNFTs = [] } = useQuery({
        queryKey: ['owned-nfts', user?.id],
        queryFn: () => user ? api.getWallet(Number(user.id)).catch(() => []) : [],
        enabled: !!user,
    });

    const allImages = useMemo(() => {
        if (!raffle) return [];
        let extraImages: string[] = [];

        if (Array.isArray(raffle.image_urls)) {
            extraImages = raffle.image_urls;
        } else if (typeof raffle.image_urls === 'string') {
            try {
                const parsed = JSON.parse(raffle.image_urls);
                if (Array.isArray(parsed)) extraImages = parsed;
            } catch {
                extraImages = [];
            }
        }

        return [
            raffle.imagem,
            ...extraImages,
        ].filter((value, index, self) => Boolean(value) && self.indexOf(value) === index);
    }, [raffle]);

    useEffect(() => {
        if (allImages.length > 0 && !allImages.includes(activeImage)) {
            setActiveImage(allImages[0]);
        }
    }, [activeImage, allImages]);

    const groupedActivities = useMemo(() => {
        const grouped = new Map<string, { id: string; name: string; avatarUrl?: string; tickets: number; joinedAt?: string }>();

        participants.forEach((participant: any) => {
            const joinedAt = participant.created_at || participant.joined_at || participant.date;
            const timestampBucket = joinedAt ? Math.floor(new Date(joinedAt).getTime() / 1000) : participant.ticket_id;
            const key = `${participant.user_id || participant.name}-${timestampBucket}`;
            const existing = grouped.get(key);

            if (existing) {
                existing.tickets += 1;
                if (joinedAt && (!existing.joinedAt || new Date(joinedAt) > new Date(existing.joinedAt))) {
                    existing.joinedAt = joinedAt;
                }
                return;
            }

            grouped.set(key, {
                id: String(participant.hash || participant.ticket_id || key),
                name: participant.name || participant.user_name || 'Participante',
                avatarUrl: participant.picture || participant.user_avatar,
                tickets: 1,
                joinedAt,
            });
        });

        return Array.from(grouped.values())
            .sort((a, b) => {
                if (!a.joinedAt || !b.joinedAt) return 0;
                return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
            })
            .slice(0, 10);
    }, [participants]);

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

    const totalSlots = raffle.maxParticipantes > 0 ? raffle.maxParticipantes : 0;
    const progress = totalSlots > 0 ? Math.min((raffle.participantes / totalSlots) * 100, 100) : 0;

    const getNFTTicketValue = (nft: any) => Math.max(0, Math.floor(Number(nft?.ticketValue ?? nft?.price ?? nft?.preco ?? 0)));

    const userTicketsCount = participants.reduce((acc: number, p: any) =>
        Number(p.user_id) === Number(user?.id) ? acc + (p.tickets || 1) : acc, 0);

    const ticketPrice = typeof raffle.custoNFT === 'number' ? raffle.custoNFT : 0;
    const totalSelectedNFTs = Object.values(selectedNFTs).reduce((a, b) => a + b, 0);
    const selectedNFTRawTickets = Object.entries(selectedNFTs).reduce((acc, [nftId, qty]: [string, any]) => {
        const nft = ownedNFTs.find((n: any) => n.id === nftId);
        return acc + (nft ? getNFTTicketValue(nft) * Number(qty || 0) : 0);
    }, 0);
    const nftTicketsCovered = Math.min(quantity, selectedNFTRawTickets);
    const ticketsToReceive = quantity;

    const calculateChance = (tickets: number) => {
        if (!raffle.participantes || tickets === 0) return 0;
        return Math.min((tickets / (raffle.participantes || 1)) * 100, 100);
    };

    const currentChance = calculateChance(userTicketsCount);
    const potentialChance = calculateChance(userTicketsCount + ticketsToReceive);

    const remainingCotas = Math.max(0, quantity - nftTicketsCovered);
    const pixRemainder = Math.max(0, remainingCotas * ticketPrice);
    const formatCotas = (value: number) => String(Math.max(0, Math.floor(value)));
    const rawDate = raffle.dataFim;
    const endDate = rawDate ? new Date(rawDate) : null;
    const isValidDate = endDate && !isNaN(endDate.getTime());

    const handleNFTQuantityChange = (nftId: string, delta: number, maxSelectable: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedNFTs(prev => {
            const next = { ...prev };
            const current = next[nftId] || 0;
            const newVal = Math.max(0, Math.min(maxSelectable, current + delta));
            if (newVal === 0) delete next[nftId];
            else next[nftId] = newVal;
            return next;
        });
    };

    const toggleNFTSelection = (nft: any, canAdd: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!selectedNFTs[nft.id] && !canAdd) {
            Alert.alert(
                'Quantidade insuficiente',
                `Esse NFT vale ${getNFTTicketValue(nft)} cota(s). Aumente a quantidade desejada para usar este item.`
            );
            return;
        }
        setSelectedNFTs(prev => {
            const next = { ...prev };
            if (next[nft.id]) {
                delete next[nft.id];
            } else {
                next[nft.id] = 1;
            }
            return next;
        });
    };

    const handleJoinWithNFTs = () => {
        setPixData(null); // Reset pixData when opening NFT selection
        setCheckoutStep('nfts');
        setShowModal(true);
    };

    const handleOpenCheckout = () => {
        if (!user) {
            Alert.alert('Login necessário', 'Entre na sua conta para participar.');
            return;
        }
        setSelectedNFTs({});
        handleJoinWithNFTs();
    };

    const handleConfirmNFTs = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (pixRemainder > 0) {
            setCheckoutStep('processing');
            try {
                const data = await api.createPayment(user!.id, pixRemainder, [{ id: 'raffle_entry', quantity: remainingCotas }]);
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

    const executeJoin = async (isSimulation = false) => {
        setCheckoutStep('processing');
        try {
            // Pass txHash (transactionId) if it was a PIX payment, or fixed string for simulation
            const txHash = isSimulation ? 'OFF_CHAIN_SIMULATION' : pixData?.transactionId;
            await api.joinRaffle(Number(id), Number(user!.id), selectedNFTs, quantity, txHash);
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
                <RaffleHero
                    images={allImages}
                    activeImage={activeImage}
                    title={raffle.titulo}
                    onSelectImage={setActiveImage}
                    onBack={() => router.back()}
                />

                <View style={s.content}>
                    <View style={s.headerSection}>
                        <View style={s.breadcrumb}>
                            <Text style={s.breadItem}>Início</Text>
                            <ChevronRight size={10} color="#6b7280" />
                            <Text style={s.breadItem}>Sorteios</Text>
                            <ChevronRight size={10} color="#6b7280" />
                            <Text style={[s.breadItem, { color: theme.colors.foreground }]}>{raffle.categoria}</Text>
                        </View>

                        <View style={s.statusRow}>
                            <View style={[s.statusBadge, raffle.status !== 'ativo' && s.statusInactive]}>
                                <View style={[s.statusDot, raffle.status !== 'ativo' && { backgroundColor: '#6b7280' }]} />
                                <Text style={[s.statusText, raffle.status !== 'ativo' && { color: '#6b7280' }]}>
                                    {raffle.status === 'ativo' ? 'SORTEIO ATIVO' : 'ENCERRADO'}
                                </Text>
                            </View>
                            <View style={s.participantsRow}>
                                <Users size={12} color={theme.colors.mutedForeground} />
                                <Text style={s.soldCount}>+{raffle.participantes} vendidos</Text>
                            </View>
                        </View>

                        <Text style={s.title}>{raffle.titulo}</Text>
                        
                        <View style={s.prizeContainer}>
                            <View style={s.prizeLabelRow}>
                                <TicketIcon size={20} color={theme.colors.primary} />
                                <Text style={s.prizeLabel}>Cota Mínima: R$ {ticketPrice.toFixed(2)}</Text>
                            </View>
                            <View style={s.shippingBanner}>
                                <TruckIcon size={14} color={theme.colors.primary} />
                                <View>
                                    <Text style={s.shippingTitle}>Sorteio Digital Garantido</Text>
                                    <Text style={s.shippingSub}>Entrega imediata na carteira</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={s.infoCard}>
                        <Text style={s.sectionTitle}>Características principais</Text>
                        <View style={s.table}>
                            {[
                                ["Prêmio", raffle.premio],
                                ["Valor de face", `R$ ${raffle.premioValor?.toLocaleString("pt-BR")}`],
                                ["Preço/Bilhete", `R$ ${ticketPrice.toFixed(2)}`],
                                ["Categoria", raffle.categoria],
                                ["Encerramento", isValidDate ? format(endDate!, "dd/MM/yyyy") : '—'],
                                ["Status", raffle.status === 'ativo' ? 'Ativo' : 'Encerrado'],
                            ].map(([label, val], i) => (
                                <View key={label} style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}>
                                    <Text style={s.tableLabel}>{label}</Text>
                                    <Text style={s.tableValue}>{val}</Text>
                                </View>
                            ))}
                        </View>
                        
                        <View style={s.progressSection}>
                            <View style={s.progressLabels}>
                                <Text style={s.progressText}>{raffle.participantes} vendidos</Text>
                                <Text style={s.progressText}>{totalSlots > 0 ? `${totalSlots} total` : '—'}</Text>
                            </View>
                            <View style={s.progressBarBg}>
                                <LinearGradient
                                    colors={theme.gradients.primary as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[s.progressBarFill, { width: `${progress}%` }]}
                                />
                            </View>
                        </View>
                    </View>

                    <SellerCard seller={raffle.seller} />

                    <View style={s.statsGrid}>
                        <View style={s.statCard}>
                            <Text style={s.statCardLab}>CHANCE ATUAL</Text>
                            <Text style={s.statCardVal}>{currentChance.toFixed(2)}%</Text>
                        </View>
                        <View style={s.statCard}>
                            <Text style={s.statCardLab}>CHANCE COM SELEÇÃO</Text>
                            <Text style={[s.statCardVal, { color: theme.colors.primary }]}>{potentialChance.toFixed(2)}%</Text>
                        </View>
                    </View>

                    <PurchaseActivity activities={groupedActivities} />

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
                custo={ticketPrice}
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
                                    <View style={s.purchaseSummary}>
                                        <Text style={s.purchaseSummaryTitle}>Resumo da compra</Text>
                                        <View style={s.purchaseSummaryRow}>
                                            <Text style={s.purchaseSummaryLab}>Cotas desejadas</Text>
                                            <Text style={s.purchaseSummaryVal}>{quantity}</Text>
                                        </View>
                                        <View style={s.purchaseSummaryRow}>
                                            <Text style={s.purchaseSummaryLab}>NFTs selecionados</Text>
                                            <Text style={s.purchaseSummaryVal}>{totalSelectedNFTs}</Text>
                                        </View>
                                        <View style={s.purchaseSummaryRow}>
                                            <Text style={s.purchaseSummaryLab}>Cotas cobertas por NFTs</Text>
                                            <Text style={s.purchaseSummaryVal}>{formatCotas(nftTicketsCovered)}</Text>
                                        </View>
                                        <View style={s.purchaseSummaryRow}>
                                            <Text style={s.purchaseSummaryLab}>Cotas restantes</Text>
                                            <Text style={[s.purchaseSummaryVal, { color: remainingCotas > 0 ? theme.colors.primary : theme.colors.foreground }]}>
                                                {formatCotas(remainingCotas)}
                                            </Text>
                                        </View>
                                        <View style={[s.purchaseSummaryRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 8 }]}>
                                            <Text style={s.purchaseSummaryLab}>Chance com seleção</Text>
                                            <Text style={[s.purchaseSummaryVal, { color: theme.colors.primary, fontSize: 18 }]}>{potentialChance.toFixed(2)}%</Text>
                                        </View>
                                    </View>

                                    {ownedNFTs.length > 0 ? (
                                        <>
                                            <View style={s.nftSelectionHeader}>
                                                <Gem size={18} color={theme.colors.primary} />
                                                <Text style={s.sectionTitle}>Usar Meus NFTs para Desconto</Text>
                                            </View>
                                            <View style={s.modalGrid}>
                                                {ownedNFTs.map((nft: any) => {
                                                    const available = Math.max(0, Number(nft.quantidade ?? 0));
                                                    const selected = selectedNFTs[nft.id] || 0;
                                                    const isSelected = selected > 0;
                                                    const unitTicketValue = getNFTTicketValue(nft);
                                                    const selectedTicketsWithoutCurrent = selectedNFTRawTickets - (selected * unitTicketValue);
                                                    const maxSelectableByQuantity = unitTicketValue > 0
                                                        ? Math.floor(Math.max(0, quantity - selectedTicketsWithoutCurrent) / unitTicketValue)
                                                        : 0;
                                                    const maxSelectable = Math.min(available, maxSelectableByQuantity);
                                                    const canAdd = maxSelectable > 0;
                                                    return (
                                                        <View
                                                            key={nft.id}
                                                            style={[s.modalNftCard, isSelected && s.modalNftCardActive]}
                                                        >
                                                            <View style={s.modalNftMain}>
                                                                <View style={s.nftPickImgWrap}>
                                                                    {nft.image ? <Image source={{ uri: nft.image }} style={s.modalNftImage} /> : <Text style={{ fontSize: 30 }}>{nft.emoji}</Text>}
                                                                </View>

                                                                <View style={s.modalNftInfo}>
                                                                    <Text style={s.modalNftName} numberOfLines={1}>{nft.nome}</Text>
                                                                    <Text style={s.modalNftAvailable}>Em posse: {available}</Text>
                                                                    <Text style={s.modalNftDiscount}>Vale {formatCotas(unitTicketValue)} cota(s) por unidade</Text>
                                                                </View>

                                                                <View style={s.nftSelectionAction}>
                                                                    {!isSelected ? (
                                                                        <TouchableOpacity
                                                                            style={[s.addNftBtn, !canAdd && s.addNftBtnDisabled]}
                                                                            onPress={() => toggleNFTSelection(nft, canAdd)}
                                                                            disabled={!canAdd}
                                                                        >
                                                                            <Plus size={14} color={theme.colors.primaryForeground} />
                                                                            <Text style={s.addNftText}>{canAdd ? 'Adicionar' : 'Ajuste cotas'}</Text>
                                                                        </TouchableOpacity>
                                                                    ) : (
                                                                        <View style={s.stepperRow}>
                                                                            <TouchableOpacity
                                                                                onPress={() => handleNFTQuantityChange(nft.id, -1, maxSelectable)}
                                                                                style={s.stepBtn}
                                                                            >
                                                                                <Minus size={14} color={theme.colors.foreground} />
                                                                            </TouchableOpacity>
                                                                            <Text style={s.stepVal}>{selected}</Text>
                                                                            <TouchableOpacity
                                                                                onPress={() => handleNFTQuantityChange(nft.id, 1, maxSelectable)}
                                                                                style={[s.stepBtn, selected >= maxSelectable && { opacity: 0.3 }]}
                                                                                disabled={selected >= maxSelectable}
                                                                            >
                                                                                <Plus size={14} color={theme.colors.foreground} />
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        </View>
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
                                            <Text style={s.modalTotalLabel}>
                                                {remainingCotas > 0 ? `${formatCotas(remainingCotas)} cota(s) via PIX` : 'Sem PIX restante'}
                                            </Text>
                                            <Text style={s.modalTotalValue}>{formatCotas(remainingCotas)}x</Text>
                                        </View>

                                        <TouchableOpacity 
                                            style={s.modalBtn}
                                            onPress={handleConfirmNFTs}
                                        >
                                            <Text style={s.modalBtnText}>
                                                {pixRemainder > 0 ? 'Pagar com PIX' : 'Confirmar Participação'}
                                            </Text>
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
                                {__DEV__ && (
                                    <TouchableOpacity style={s.simulateBtn} onPress={() => executeJoin(true)}>
                                        <Text style={s.simulateText}>Simular Pagamento Confirmado (DEV)</Text>
                                    </TouchableOpacity>
                                )}
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
    content: { paddingHorizontal: 16, marginTop: 12 },
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
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    statCardLab: { color: theme.colors.mutedForeground, fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
    statCardVal: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800' },

    breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    breadItem: { color: '#6b7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    
    prizeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    shippingBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,255,140,0.05)', padding: 10, borderRadius: 12 },
    shippingTitle: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
    shippingSub: { color: 'rgba(0,255,140,0.6)', fontSize: 10 },

    table: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
    tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
    tableLabel: { color: theme.colors.mutedForeground, fontSize: 13, fontWeight: '600' },
    tableValue: { color: theme.colors.foreground, fontSize: 13, fontWeight: '600' },

    progressSection: { padding: 4 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressText: { color: theme.colors.mutedForeground, fontSize: 11, fontWeight: '600' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    purchaseSummary: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
    purchaseSummaryTitle: { color: theme.colors.foreground, fontSize: 14, fontWeight: '700', marginBottom: 12 },
    purchaseSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    purchaseSummaryLab: { color: theme.colors.mutedForeground, fontSize: 13 },
    purchaseSummaryVal: { color: theme.colors.foreground, fontSize: 14, fontWeight: '700' },
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
    modalContent: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800' },
    modalClose: { padding: 4, backgroundColor: theme.colors.accent, borderRadius: 20 },
    modalBody: { gap: 16 },
    modalSub: { color: theme.colors.mutedForeground, fontSize: 14, marginBottom: 8 },
    nftSelectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 4 },
    modalGrid: { gap: 10, marginBottom: 10 },
    modalNftCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden' },
    modalNftCardActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(0,255,140,0.05)' },
    modalNftMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    nftPickImgWrap: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' },
    modalNftImage: { width: '100%', height: '100%' },
    modalNftInfo: { flex: 1, minWidth: 0 },
    modalNftName: { color: theme.colors.foreground, fontSize: 13, fontWeight: '700', marginBottom: 2 },
    modalNftAvailable: { color: theme.colors.mutedForeground, fontSize: 11, marginTop: 4 },
    modalNftDiscount: { color: theme.colors.primary, fontSize: 11, fontWeight: '700', marginTop: 6 },

    nftSelectionAction: { minHeight: 38, alignItems: 'flex-end', justifyContent: 'center' },
    addNftBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, minWidth: 108 },
    addNftBtnDisabled: { opacity: 0.45 },
    addNftText: { color: theme.colors.primaryForeground, fontSize: 11, fontWeight: '800' },
    
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 6, minHeight: 38 },
    stepBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    stepVal: { color: theme.colors.foreground, fontSize: 13, fontWeight: '800', minWidth: 22, textAlign: 'center' },
    
    emptyWallet: { padding: 20, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, alignItems: 'center' },
    emptyWalletText: { color: theme.colors.mutedForeground, fontSize: 13 },
    modalFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 10 },
    modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTotalLabel: { color: theme.colors.foreground, fontSize: 14, fontWeight: '700' },
    modalTotalValue: { color: theme.colors.primary, fontSize: 24, fontWeight: '900' },
    modalBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    modalBtnText: { color: theme.colors.primaryForeground, fontSize: 16, fontWeight: '800' },
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
