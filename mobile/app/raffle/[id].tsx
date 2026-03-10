import React from 'react';
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    StyleSheet, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ArrowLeft, Ticket, Clock, Users, ShieldCheck, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../components/providers/AuthProvider';

export default function RaffleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [joining, setJoining] = useState(false);

    const { data: raffle, isLoading } = useQuery({
        queryKey: ['raffle', id],
        queryFn: () => api.getRaffle(id).catch(() => null),
    });

    if (isLoading) {
        return (
            <View style={s.loadingContainer}>
                <Text style={s.loadingText}>Carregando sorteio...</Text>
            </View>
        );
    }

    if (!raffle) {
        return (
            <View style={s.loadingContainer}>
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

            {/* Hero Image */}
            <View style={s.heroContainer}>
                <Image source={{ uri: imageUri }} style={s.heroImage} resizeMode="cover" />
                <LinearGradient colors={['rgba(10,11,18,0.3)', 'rgba(10,11,18,0.98)']} style={s.heroGradient} />

                {/* Back button */}
                <SafeAreaView edges={['top']} style={s.backWrapper}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.back();
                        }}
                        style={s.backBtn}
                    >
                        <ArrowLeft size={20} color="#f9fafb" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Badge */}
                <View style={s.statusBadge}>
                    <View style={s.statusDot} />
                    <Text style={s.statusText}>{raffle.status === 'ativo' ? 'ATIVO' : 'ENCERRADO'}</Text>
                </View>
            </View>

            <ScrollView style={s.content} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Text style={s.title}>{raffle.titulo}</Text>
                <Text style={s.prize}>{raffle.premio}</Text>

                {/* Stats row */}
                <View style={s.statsRow}>
                    <View style={s.statItem}>
                        <Users size={14} color="#00FF8C" />
                        <Text style={s.statValue}>{raffle.participantes}</Text>
                        <Text style={s.statLabel}>Participantes</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statItem}>
                        <Ticket size={14} color="#00FF8C" />
                        <Text style={s.statValue}>{raffle.maxParticipantes}</Text>
                        <Text style={s.statLabel}>Cotas Totais</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statItem}>
                        <Clock size={14} color="#00FF8C" />
                        <Text style={s.statValue} numberOfLines={1}>
                            {isValidDate
                                ? formatDistanceToNow(endDate!, { locale: ptBR })
                                : '—'}
                        </Text>
                        <Text style={s.statLabel}>Restam</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={s.progressSection}>
                    <View style={s.progressHeader}>
                        <Text style={s.progressTitle}>Preenchimento</Text>
                        <Text style={[s.progressPct, isAlmostFull && s.progressPctHot]}>
                            {progress.toFixed(0)}%
                        </Text>
                    </View>
                    <View style={s.progressBg}>
                        <View style={[s.progressFill, { width: `${progress}%` as any }, isAlmostFull && s.progressFillHot]} />
                    </View>
                    {isAlmostFull && (
                        <View style={s.urgencyBadge}>
                            <Zap size={12} color="#f97316" />
                            <Text style={s.urgencyText}>Quase esgotado — garanta sua cota!</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                {raffle.descricao ? (
                    <View style={s.descSection}>
                        <Text style={s.sectionTitle}>Sobre o Prêmio</Text>
                        <Text style={s.descText}>{raffle.descricao}</Text>
                    </View>
                ) : null}

                {/* Guarantee */}
                <View style={s.guaranteeRow}>
                    <ShieldCheck size={18} color="#00FF8C" />
                    <Text style={s.guaranteeText}>Sorteio verificado e auditado pela plataforma MundoPix</Text>
                </View>
            </ScrollView>

            {/* Bottom checkout bar */}
            <View style={s.checkoutBar}>
                <View style={s.quantityRow}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setQuantity(q => Math.max(1, q - 1));
                        }}
                        style={s.qBtn}
                    >
                        <Text style={s.qBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.qValue}>{quantity}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setQuantity(q => q + 1);
                        }}
                        style={s.qBtn}
                    >
                        <Text style={s.qBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleJoin();
                    }}
                    disabled={joining}
                    style={[s.joinBtn, joining && s.joinBtnDisabled]}
                >
                    <Text style={s.joinBtnText}>
                        {joining ? 'Processando...' : `Participar — R$ ${(custo * quantity).toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0A0B12' },
    loadingContainer: { flex: 1, backgroundColor: '#0A0B12', alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: '#6b7280' },
    heroContainer: { height: 280, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroGradient: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
    backWrapper: { position: 'absolute', top: 0, left: 0, right: 0 },
    backBtn: { margin: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    statusBadge: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,140,0.15)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.4)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF8C' },
    statusText: { color: '#00FF8C', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    title: { color: '#f9fafb', fontSize: 24, fontWeight: '900', marginBottom: 4 },
    prize: { color: '#00FF8C', fontSize: 15, fontWeight: '600', marginBottom: 20 },
    statsRow: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 24 },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
    statValue: { color: '#f9fafb', fontSize: 14, fontWeight: '800' },
    statLabel: { color: '#4b5563', fontSize: 10 },
    statDivider: { width: 1, backgroundColor: '#1f2937', marginVertical: 12 },
    progressSection: { marginBottom: 24 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressTitle: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
    progressPct: { color: '#00FF8C', fontSize: 13, fontWeight: '700' },
    progressPctHot: { color: '#f97316' },
    progressBg: { height: 6, backgroundColor: '#1f2937', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#00FF8C', borderRadius: 3 },
    progressFillHot: { backgroundColor: '#f97316' },
    urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
    urgencyText: { color: '#f97316', fontSize: 12, fontWeight: '600' },
    descSection: { marginBottom: 20 },
    sectionTitle: { color: '#f9fafb', fontSize: 16, fontWeight: '700', marginBottom: 8 },
    descText: { color: '#6b7280', fontSize: 14, lineHeight: 22 },
    guaranteeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,255,140,0.06)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(0,255,140,0.2)', marginBottom: 20 },
    guaranteeText: { color: '#9ca3af', fontSize: 13, flex: 1 },
    checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 32, backgroundColor: '#0d101a', borderTopWidth: 1, borderTopColor: '#1f2937' },
    quantityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
    qBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
    qBtnText: { color: '#f9fafb', fontSize: 20, fontWeight: '700' },
    qValue: { color: '#f9fafb', fontSize: 16, fontWeight: '800', width: 32, textAlign: 'center' },
    joinBtn: { flex: 1, backgroundColor: '#00FF8C', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
    joinBtnDisabled: { opacity: 0.6 },
    joinBtnText: { color: '#0A0B12', fontSize: 15, fontWeight: '800' },
});
