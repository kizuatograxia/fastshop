import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ShieldCheck, Award, CalendarClock, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../components/providers/AuthProvider';
import { DecorativeBackground } from '../../components/DecorativeBackground';
import { RaffleHero } from '../../components/raffle/RaffleHero';
import { RaffleStatsBar } from '../../components/raffle/RaffleStatsBar';
import { RaffleProgress } from '../../components/raffle/RaffleProgress';
import { RaffleCheckoutBar } from '../../components/raffle/RaffleCheckoutBar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RaffleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [joining, setJoining] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const { data: raffle, isLoading } = useQuery({
        queryKey: ['raffle', id],
        queryFn: () => api.getRaffle(id).catch(() => null),
    });

    if (isLoading) {
        return (
            <View style={s.centered}>
                <DecorativeBackground />
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
    const imageUri = raffle.imagem || raffle.image_urls?.[0] || 'https://placehold.co/600x400/111827/00FF8C';
    const isAlmostFull = progress >= 80;
    const rawDate = raffle.dataFim;
    const endDate = rawDate ? new Date(rawDate) : null;
    const isValidDate = endDate && !isNaN(endDate.getTime());
    const currentChance = raffle.maxParticipantes > 0
        ? ((1 / (raffle.maxParticipantes - raffle.participantes || 1)) * 100).toFixed(2)
        : '0';

    const handleJoin = async () => {
        if (!user) {
            Alert.alert('Login necessário', 'Entre na sua conta para participar.');
            return;
        }
        setJoining(true);
        try {
            await api.joinRaffle(Number(id), Number(user.id), {}, quantity);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🎉 Participação confirmada!', `Você está concorrendo com ${quantity} cota(s)!`);
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', err.message || 'Não foi possível participar. Tente novamente.');
        } finally {
            setJoining(false);
        }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <DecorativeBackground />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <RaffleHero imageUri={imageUri} onBack={() => router.back()} />

                {/* Content */}
                <View style={s.content}>
                    {/* Status badge */}
                    <View style={s.statusRow}>
                        <View style={[s.statusBadge, raffle.status !== 'ativo' && s.statusInactive]}>
                            <View style={[s.statusDot, raffle.status !== 'ativo' && { backgroundColor: '#6b7280' }]} />
                            <Text style={[s.statusText, raffle.status !== 'ativo' && { color: '#6b7280' }]}>
                                {raffle.status === 'ativo' ? 'SORTEIO ATIVO' : 'ENCERRADO'}
                            </Text>
                        </View>
                        <Text style={s.soldCount}>+{raffle.participantes} vendidos</Text>
                    </View>

                    {/* Title & Prize */}
                    <Text style={s.title}>{raffle.titulo}</Text>
                    <Text style={s.prizeLabel}>{raffle.premio}</Text>

                    {/* Price */}
                    <View style={s.priceCard}>
                        <Text style={s.priceValue}>R$ {custo.toFixed(2)}</Text>
                        <Text style={s.installments}>
                            em 10x R$ {(custo / 10).toFixed(2)} sem juros
                        </Text>
                    </View>

                    {/* Stats */}
                    <RaffleStatsBar
                        participantes={raffle.participantes}
                        maxParticipantes={raffle.maxParticipantes}
                        endDate={endDate}
                        isValidDate={!!isValidDate}
                    />

                    {/* Progress */}
                    <RaffleProgress progress={progress} isAlmostFull={isAlmostFull} />

                    {/* Quick Info */}
                    <View style={s.infoCard}>
                        <Text style={s.infoTitle}>Informações do Sorteio</Text>
                        <InfoRow icon={<Award size={14} color="#00FF8C" />} label="Prêmio Total" value={`R$ ${raffle.premioValor?.toLocaleString('pt-BR') ?? '—'}`} />
                        <InfoRow icon={<TrendingUp size={14} color="#00FF8C" />} label="Oportunidade Atual" value={`${currentChance}%`} />
                        <InfoRow
                            icon={<CalendarClock size={14} color="#00FF8C" />}
                            label="Encerramento"
                            value={isValidDate ? format(endDate!, "dd 'de' MMMM, yyyy", { locale: ptBR }) : '—'}
                        />
                    </View>

                    {/* Highlights */}
                    <View style={s.highlightsCard}>
                        <Text style={s.infoTitle}>O que você precisa saber</Text>
                        {['Prêmio de luxo verificado', 'Sorteio auditado pela blockchain', 'Entrega digital imediata na carteira', 'Participação garantida ou reembolso'].map((item, i) => (
                            <View key={i} style={s.bulletRow}>
                                <Text style={s.bullet}>•</Text>
                                <Text style={s.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Description */}
                    {raffle.descricao ? (
                        <View style={s.descCard}>
                            <Text style={s.infoTitle}>Descrição</Text>
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
                    ) : null}

                    {/* Guarantee */}
                    <View style={s.guaranteeCard}>
                        <ShieldCheck size={18} color="#00FF8C" />
                        <Text style={s.guaranteeText}>
                            Compra Garantida — receba o bilhete que está esperando ou devolvemos suas NFTs.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <RaffleCheckoutBar
                quantity={quantity}
                setQuantity={setQuantity}
                custo={custo}
                joining={joining}
                onJoin={handleJoin}
            />
        </View>
    );
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View style={s.infoRow}>
        {icon}
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
    </View>
);

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0A0B12' },
    centered: { flex: 1, backgroundColor: '#0A0B12', alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: '#6b7280', fontSize: 14 },
    content: { paddingHorizontal: 16, marginTop: -40 },

    // Status
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.3)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    },
    statusInactive: { backgroundColor: 'rgba(107,114,128,0.1)', borderColor: 'rgba(107,114,128,0.3)' },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF8C' },
    statusText: { color: '#00FF8C', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    soldCount: { color: '#6b7280', fontSize: 12 },

    // Title
    title: { color: '#f9fafb', fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 4 },
    prizeLabel: { color: '#00FF8C', fontSize: 14, fontWeight: '600', marginBottom: 16 },

    // Price
    priceCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    priceValue: { color: '#f9fafb', fontSize: 34, fontWeight: '300', letterSpacing: -1 },
    installments: { color: '#00FF8C', fontSize: 14, fontWeight: '600', marginTop: 4 },

    // Info card
    infoCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    infoTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '700', marginBottom: 12 },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(31,41,55,0.4)',
    },
    infoLabel: { color: '#9ca3af', fontSize: 13, flex: 1 },
    infoValue: { color: '#f9fafb', fontSize: 13, fontWeight: '600' },

    // Highlights
    highlightsCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
    bullet: { color: '#00FF8C', fontSize: 16, lineHeight: 20 },
    bulletText: { color: '#9ca3af', fontSize: 13, lineHeight: 20, flex: 1 },

    // Description
    descCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    descText: { color: '#6b7280', fontSize: 14, lineHeight: 22 },
    readMore: { color: '#00FF8C', fontSize: 13, fontWeight: '700', marginTop: 8 },

    // Guarantee
    guaranteeCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(0,255,140,0.06)', borderRadius: 16,
        padding: 14, borderWidth: 1, borderColor: 'rgba(0,255,140,0.15)',
        marginBottom: 20,
    },
    guaranteeText: { color: '#9ca3af', fontSize: 13, flex: 1, lineHeight: 18 },
});
