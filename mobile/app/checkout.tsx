import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { useWallet } from '../components/providers/WalletProvider';
import { useAuth } from '../components/providers/AuthProvider';
import { api } from '../lib/api';
import { ArrowLeft, Ticket, ShoppingCart, QrCode, Copy, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function CheckoutScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, getTotalNFTs, clearCart, buyNFTs } = useWallet();

    const [isLoading, setIsLoading] = useState(false);
    const [pixData, setPixData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    const totalPrice = cartItems.reduce((sum, nft) => sum + nft.preco * nft.quantidade, 0);
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalPrice = Math.max(0, totalPrice - discount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await api.validateCoupon(couponCode, totalPrice);
            setAppliedCoupon({
                code: res.coupon.code,
                discount: res.discount,
                type: res.coupon.type
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Sucesso", `Cupom aplicado! Desconto de ${Math.floor(res.discount)}`);
        } catch (error: any) {
            setAppliedCoupon(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Erro", error.message || "Cupom inválido");
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePayWithPix = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const itemsToBuy = cartItems.map(item => ({ id: item.id, quantity: item.quantidade }));
            const data = await api.createPayment(user.id, finalPrice, itemsToBuy);

            setPixData({
                qrCode: data.qrCodeBase64 ? `data:image/png;base64,${data.qrCodeBase64}` : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode)}`,
                copyPasteCode: data.copyPaste,
                transactionId: data.transactionId,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            Alert.alert("Erro no Pagamento", error.message || "Não foi possível gerar o PIX.");
        } finally {
            setIsLoading(false);
        }
    };

    const simulateSuccess = async () => {
        setIsLoading(true);
        try {
            const itemsToBuy = cartItems.map(item => ({ id: item.id, quantity: item.quantidade }));
            await buyNFTs(itemsToBuy, appliedCoupon?.code);
            clearCart();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Sucesso!", "Seus NFTs foram adicionados à sua carteira.");
            router.replace('/(tabs)/profile');
        } catch (error: any) {
            Alert.alert("Erro", "Falha ao finalizar compra.");
        } finally {
            setIsLoading(false);
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

    if (cartItems.length === 0 && !pixData) {
        return (
            <ScreenWrapper style={s.root}>
                <SafeAreaView style={s.empty}>
                    <ShoppingCart size={64} color="#1f2937" />
                    <Text style={s.emptyText}>Carrinho vazio</Text>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Text style={s.backBtnText}>Voltar</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={s.root}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#0A0B12' }}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.headerBtn}>
                        <ArrowLeft size={24} color="#f9fafb" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Checkout</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={s.scroll}>
                {!pixData ? (
                    <>
                        <View style={s.section}>
                            <View style={s.sectionHeader}>
                                <ShoppingCart size={18} color="#00FF8C" />
                                <Text style={s.sectionTitle}>Resumo do Pedido</Text>
                            </View>

                            {cartItems.map((item) => (
                                <View key={item.id} style={s.itemRow}>
                                    <View style={[s.itemIcon, { backgroundColor: item.cor + '20' || '#1f2937', overflow: 'hidden' }]}>
                                        {item.image ? (
                                            <Image source={{ uri: item.image }} style={s.itemRowImage} resizeMode="contain" />
                                        ) : (
                                            <Text style={s.itemEmoji}>{item.emoji}</Text>
                                        )}
                                    </View>
                                    <View style={s.itemInfo}>
                                        <Text style={s.itemName}>{item.nome}</Text>
                                        <Text style={s.itemMeta}>x{item.quantidade}</Text>
                                    </View>
                                    <View style={s.itemPriceCol}>
                                        <View style={s.priceRow}>
                                            <Ticket size={12} color="#00FF8C" />
                                            <Text style={s.priceValue}>{Math.floor(item.preco * item.quantidade)}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={s.section}>
                            <Text style={s.sectionTitleSmall}>Cupom de Desconto</Text>
                            <View style={s.couponRow}>
                                <TextInput
                                    placeholder="INSIRA SEU CUPOM"
                                    placeholderTextColor="#4b5563"
                                    style={s.couponInput}
                                    value={couponCode}
                                    onChangeText={setCouponCode}
                                    autoCapitalize="characters"
                                    editable={!appliedCoupon}
                                />
                                <TouchableOpacity
                                    onPress={appliedCoupon ? () => setAppliedCoupon(null) : handleApplyCoupon}
                                    style={[s.couponBtn, appliedCoupon && s.couponBtnRemove]}
                                    disabled={couponLoading}
                                >
                                    {couponLoading ? (
                                        <ActivityIndicator size="small" color="#0A0B12" />
                                    ) : (
                                        <Text style={s.couponBtnText}>{appliedCoupon ? 'Remover' : 'Aplicar'}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {appliedCoupon && (
                                <Text style={s.discountText}>Desconto de {Math.floor(appliedCoupon.discount)} aplicado!</Text>
                            )}
                        </View>

                        <View style={s.summaryCard}>
                            <View style={s.summaryRow}>
                                <Text style={s.summaryLabel}>Subtotal</Text>
                                <View style={s.summaryPrice}>
                                    <Ticket size={14} color="#6b7280" />
                                    <Text style={s.summaryValue}>{Math.floor(totalPrice)}</Text>
                                </View>
                            </View>
                            {appliedCoupon && (
                                <View style={s.summaryRow}>
                                    <Text style={s.summaryLabel}>Desconto</Text>
                                    <View style={s.summaryPrice}>
                                        <Ticket size={14} color="#ef4444" />
                                        <Text style={[s.summaryValue, { color: '#ef4444' }]}>-{Math.floor(discount)}</Text>
                                    </View>
                                </View>
                            )}
                            <View style={[s.summaryRow, s.totalRowTop]}>
                                <Text style={s.totalLabel}>Total</Text>
                                <View style={s.summaryPrice}>
                                    <Ticket size={24} color="#00FF8C" />
                                    <Text style={s.totalValue}>{Math.floor(finalPrice)}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={s.payBtn}
                                onPress={handlePayWithPix}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#0A0B12" />
                                ) : (
                                    <>
                                        <QrCode size={20} color="#0A0B12" />
                                        <Text style={s.payBtnText}>Pagar com PIX</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={s.pixSection}>
                        <View style={s.pixCard}>
                            <View style={s.pixHeader}>
                                <QrCode size={24} color="#00FF8C" />
                                <Text style={s.pixTitle}>Pagamento via PIX</Text>
                            </View>

                            <View style={s.qrWrapper}>
                                <Image source={{ uri: pixData.qrCode }} style={s.qrImage} />
                            </View>

                            <View style={s.copySection}>
                                <Text style={s.copyLabel}>Copia e Cola</Text>
                                <View style={s.copyRow}>
                                    <Text style={s.copyText} numberOfLines={1}>{pixData.copyPasteCode}</Text>
                                    <TouchableOpacity onPress={handleCopy} style={s.copyBtn}>
                                        {copied ? <Check size={20} color="#00FF8C" /> : <Copy size={20} color="#f9fafb" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={s.pixSteps}>
                                <Text style={s.stepText}>1. Abra o app do seu banco</Text>
                                <Text style={s.stepText}>2. Escolha pagar via PIX</Text>
                                <Text style={s.stepText}>3. Escaneie o QR Code ou cole o código</Text>
                            </View>

                            <TouchableOpacity
                                style={s.simulateBtn}
                                onPress={simulateSuccess}
                                disabled={isLoading}
                            >
                                <Text style={s.simulateText}>Simular Pagamento Confirmado</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0A0B12' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerBtn: { padding: 8, backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
    headerTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '800' },
    scroll: { padding: 16, paddingBottom: 60 },
    section: { backgroundColor: '#111827', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    sectionTitle: { color: '#f9fafb', fontSize: 16, fontWeight: '700' },
    sectionTitleSmall: { color: '#6b7280', fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    itemEmoji: { fontSize: 24 },
    itemRowImage: { width: '100%', height: '100%' },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { color: '#f9fafb', fontWeight: '700', fontSize: 14 },
    itemMeta: { color: '#6b7280', fontSize: 12 },
    itemPriceCol: { alignItems: 'flex-end' },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    priceValue: { color: '#00FF8C', fontWeight: '800', fontSize: 16 },
    couponRow: { flexDirection: 'row', gap: 10 },
    couponInput: { flex: 1, backgroundColor: '#0A0B12', borderRadius: 12, borderWidth: 1, borderColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 12, color: '#f9fafb', fontSize: 14, fontWeight: '700' },
    couponBtn: { backgroundColor: '#00FF8C', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
    couponBtnRemove: { backgroundColor: '#ef4444' },
    couponBtnText: { color: '#0A0B12', fontWeight: '800', fontSize: 12 },
    discountText: { color: '#00FF8C', fontSize: 12, marginTop: 8, fontWeight: '600' },
    summaryCard: { backgroundColor: '#111827', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#00FF8C30' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: '#6b7280', fontSize: 14 },
    summaryPrice: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    summaryValue: { color: '#f9fafb', fontWeight: '700' },
    totalRowTop: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1f2937' },
    totalLabel: { color: '#f9fafb', fontSize: 18, fontWeight: '800' },
    totalValue: { color: '#00FF8C', fontSize: 32, fontWeight: '900' },
    payBtn: { backgroundColor: '#00FF8C', borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 },
    payBtnText: { color: '#0A0B12', fontSize: 16, fontWeight: '900' },
    pixSection: { paddingVertical: 10 },
    pixCard: { backgroundColor: '#111827', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#1f2937' },
    pixHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    pixTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '800' },
    qrWrapper: { backgroundColor: '#fff', padding: 20, borderRadius: 24, alignItems: 'center', alignSelf: 'center', marginBottom: 24 },
    qrImage: { width: 220, height: 220 },
    copySection: { marginBottom: 24 },
    copyLabel: { color: '#6b7280', fontSize: 12, marginBottom: 8 },
    copyRow: { flexDirection: 'row', backgroundColor: '#0A0B12', borderRadius: 16, padding: 12, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#1f2937' },
    copyText: { flex: 1, color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    copyBtn: { padding: 8, backgroundColor: '#111827', borderRadius: 10 },
    pixSteps: { gap: 8, marginBottom: 24 },
    stepText: { color: '#6b7280', fontSize: 13 },
    simulateBtn: { borderStyle: 'dotted', borderWidth: 1, borderColor: '#4b5563', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
    simulateText: { color: '#4b5563', fontSize: 13, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
    emptyText: { color: '#6b7280', fontSize: 18, fontWeight: '600' },
    backBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#111827', borderRadius: 12 },
    backBtnText: { color: '#00FF8C', fontWeight: '700' },
});
