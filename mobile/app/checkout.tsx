import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useWallet } from '../components/providers/WalletProvider';
import { useAuth } from '../components/providers/AuthProvider';
import { api } from '../lib/api';
import { ArrowLeft, Ticket, ShoppingCart, QrCode, Copy, Check, Info, ShieldCheck, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { theme } from '../lib/theme';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, clearCart, buyNFTs } = useWallet();

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
        } catch (error: any) {
            setAppliedCoupon(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Cupom Inválido", error.message || "Este cupom não é válido ou já expirou.");
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
            Alert.alert("Erro no Pagamento", error.message || "Não foi possível gerar o código PIX no momento.");
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
            
            Alert.alert(
                "Compra Realizada!", 
                "Seus NFTs foram adicionados à sua carteira com sucesso. Você pode vê-los no seu perfil.",
                [{ text: "Ver no Perfil", onPress: () => router.replace('/(tabs)/profile') }]
            );
        } catch (error: any) {
            Alert.alert("Erro", "Falha ao processar compra. Verifique sua conexão.");
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
                    <View style={s.emptyIconCircle}>
                        <ShoppingCart size={40} color={theme.colors.mutedForeground} />
                    </View>
                    <Text style={s.emptyTitle}>Carrinho Vazio</Text>
                    <Text style={s.emptySub}>Você ainda não adicionou nenhum NFT para checkout.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={s.emptyBtn}>
                        <Text style={s.emptyBtnText}>Explorar Catálogo</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={s.root}>
            <SafeAreaView edges={['top']} style={s.headerWrap}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.headerBtn}>
                        <ArrowLeft size={22} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Finalizar Compra</Text>
                    <View style={{ width: 44 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                {!pixData ? (
                    <>
                        {/* Order Summary */}
                        <View style={s.section}>
                            <View style={s.sectionHeader}>
                                <ShoppingCart size={18} color={theme.colors.primary} />
                                <Text style={s.sectionTitle}>Seu Pedido</Text>
                                <View style={s.itemCountBadge}>
                                    <Text style={s.itemCountText}>{cartItems.length}</Text>
                                </View>
                            </View>

                            {cartItems.map((item) => (
                                <View key={item.id} style={s.itemRow}>
                                    <View style={[s.itemImageWrap, { backgroundColor: item.cor ? `${item.cor}20` : theme.colors.accent }]}>
                                        <Image source={item.image} style={s.itemImage} contentFit="contain" />
                                    </View>
                                    <View style={s.itemInfo}>
                                        <Text style={s.itemName} numberOfLines={1}>{item.nome}</Text>
                                        <Text style={s.itemRarity}>{item.raridade || 'Comum'}</Text>
                                    </View>
                                    <View style={s.itemPriceWrap}>
                                        <View style={s.priceRow}>
                                            <Ticket size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                                            <Text style={s.priceValue}>{Math.floor(item.preco * item.quantidade)}</Text>
                                        </View>
                                        <Text style={s.itemQty}>x{item.quantidade}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Coupon Section */}
                        <View style={s.section}>
                            <View style={s.sectionHeader}>
                                <Ticket size={18} color={theme.colors.primary} />
                                <Text style={s.sectionTitle}>Cupom de Desconto</Text>
                            </View>
                            <View style={s.couponRow}>
                                <TextInput
                                    placeholder="DIGITE O CÓDIGO"
                                    placeholderTextColor={theme.colors.mutedForeground}
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
                                        <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
                                    ) : (
                                        <Text style={s.couponBtnText}>{appliedCoupon ? 'Remover' : 'Aplicar'}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {appliedCoupon && (
                                <View style={s.couponSuccessBadge}>
                                    <Zap size={14} color={theme.colors.primary} fill={theme.colors.primary} />
                                    <Text style={s.couponSuccessText}>Economia de {Math.floor(appliedCoupon.discount)} LP garantida!</Text>
                                </View>
                            )}
                        </View>

                        {/* Payment Summary */}
                        <View style={s.summaryCard}>
                            <LinearGradient 
                                colors={['rgba(0,255,140,0.05)', 'transparent']} 
                                style={StyleSheet.absoluteFill} 
                                start={{x: 0, y: 0}} 
                                end={{x: 1, y: 1}} 
                            />
                            
                            <View style={s.summaryRow}>
                                <Text style={s.summaryLabel}>Subtotal</Text>
                                <View style={s.summaryValRow}>
                                    <Ticket size={12} color={theme.colors.mutedForeground} />
                                    <Text style={s.summaryValue}>{Math.floor(totalPrice)}</Text>
                                </View>
                            </View>

                            {appliedCoupon && (
                                <View style={s.summaryRow}>
                                    <Text style={s.summaryLabel}>Desconto Cupom</Text>
                                    <View style={s.summaryValRow}>
                                        <Text style={[s.summaryValue, { color: theme.colors.destructive }]}>-{Math.floor(discount)}</Text>
                                    </View>
                                </View>
                            )}

                            <View style={s.divider} />

                            <View style={s.totalRow}>
                                <View>
                                    <Text style={s.totalLabel}>Total a pagar</Text>
                                    <View style={s.secureRow}>
                                        <ShieldCheck size={12} color={theme.colors.primary} />
                                        <Text style={s.secureText}>Pagamento Seguro</Text>
                                    </View>
                                </View>
                                <View style={s.totalValRow}>
                                    <Ticket size={24} color={theme.colors.primary} style={{ marginRight: 6 }} />
                                    <Text style={s.totalValue}>{Math.floor(finalPrice)}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={s.payBtn}
                                onPress={handlePayWithPix}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={theme.colors.primaryForeground} />
                                ) : (
                                    <>
                                        <QrCode size={20} color={theme.colors.primaryForeground} />
                                        <Text style={s.payBtnText}>Pagar com PIX</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    /* PIX Interface */
                    <View style={s.pixContainer}>
                        <View style={s.pixCard}>
                            <View style={s.pixHeader}>
                                <View style={s.pixIconCircle}>
                                    <QrCode size={24} color={theme.colors.primary} />
                                </View>
                                <View>
                                    <Text style={s.pixTitle}>Aguardando Pagamento</Text>
                                    <Text style={s.pixSubtitle}>Finalize o pagamento no seu app de banco</Text>
                                </View>
                            </View>

                            <View style={s.qrSection}>
                                <View style={s.qrWrapper}>
                                    <Image source={pixData.qrCode} style={s.qrImage} />
                                </View>
                                <View style={s.timerRow}>
                                    <Info size={14} color={theme.colors.mutedForeground} />
                                    <Text style={s.timerText}>O código expira em 30 minutos</Text>
                                </View>
                            </View>

                            <View style={s.copyLabelRow}>
                                <Text style={s.copyLabel}>Copia e Cola</Text>
                                {copied && <Text style={s.copiedFeedback}>Copiado!</Text>}
                            </View>
                            
                            <TouchableOpacity style={s.copyBox} activeOpacity={0.7} onPress={handleCopy}>
                                <Text style={s.copyCode} numberOfLines={1}>{pixData.copyPasteCode}</Text>
                                <View style={s.copyActionBtn}>
                                    {copied ? <Check size={18} color={theme.colors.primary} /> : <Copy size={18} color={theme.colors.foreground} />}
                                </View>
                            </TouchableOpacity>

                            <View style={s.instructions}>
                                <Text style={s.instructionTitle}>Como pagar:</Text>
                                <View style={s.instructionItem}>
                                    <View style={s.dot} />
                                    <Text style={s.instructionText}>Copie o código acima ou escaneie o QR Code.</Text>
                                </View>
                                <View style={s.instructionItem}>
                                    <View style={s.dot} />
                                    <Text style={s.instructionText}>Abra o app do seu banco e escolha 'Pagar via PIX'.</Text>
                                </View>
                                <View style={s.instructionItem}>
                                    <View style={s.dot} />
                                    <Text style={s.instructionText}>Cole o código e confirme o pagamento.</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={s.confirmBtn}
                                onPress={simulateSuccess}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={theme.colors.primary} />
                                ) : (
                                    <Text style={s.confirmBtnText}>Já realizei o pagamento</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    headerWrap: { backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    headerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerTitle: { color: theme.colors.foreground, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    
    scroll: { padding: 16, paddingBottom: 100 },
    
    section: { backgroundColor: theme.colors.card, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    sectionTitle: { color: theme.colors.foreground, fontSize: 16, fontWeight: '800' },
    itemCountBadge: { backgroundColor: 'rgba(0,255,140,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    itemCountText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
    
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    itemImageWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    itemImage: { width: '80%', height: '80%' },
    itemInfo: { flex: 1, marginLeft: 14, gap: 2 },
    itemName: { color: theme.colors.foreground, fontWeight: '700', fontSize: 15 },
    itemRarity: { color: theme.colors.mutedForeground, fontSize: 11, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 0.5 },
    itemPriceWrap: { alignItems: 'flex-end', gap: 2 },
    priceRow: { flexDirection: 'row', alignItems: 'center' },
    priceValue: { color: theme.colors.primary, fontWeight: '900', fontSize: 18 },
    itemQty: { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600' },

    couponRow: { flexDirection: 'row', gap: 10 },
    couponInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 14, color: theme.colors.foreground, fontSize: 14, fontWeight: '800' },
    couponBtn: { backgroundColor: theme.colors.primary, borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center' },
    couponBtnRemove: { backgroundColor: theme.colors.destructive },
    couponBtnText: { color: theme.colors.primaryForeground, fontWeight: '900', fontSize: 13 },
    couponSuccessBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,255,140,0.05)', padding: 12, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(0,255,140,0.1)' },
    couponSuccessText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },

    summaryCard: { backgroundColor: theme.colors.card, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(0,255,140,0.15)', overflow: 'hidden' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    summaryLabel: { color: theme.colors.mutedForeground, fontSize: 14, fontWeight: '600' },
    summaryValRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    summaryValue: { color: theme.colors.foreground, fontWeight: '700', fontSize: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: theme.colors.foreground, fontSize: 14, fontWeight: '600' },
    secureRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    secureText: { color: theme.colors.primary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    totalValRow: { flexDirection: 'row', alignItems: 'center' },
    totalValue: { color: theme.colors.primary, fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    payBtn: { backgroundColor: theme.colors.primary, borderRadius: 20, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
    payBtnText: { color: theme.colors.primaryForeground, fontSize: 17, fontWeight: '900' },

    pixContainer: { paddingVertical: 10 },
    pixCard: { backgroundColor: theme.colors.card, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    pixHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
    pixIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0,255,140,0.1)', alignItems: 'center', justifyContent: 'center' },
    pixTitle: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800' },
    pixSubtitle: { color: theme.colors.mutedForeground, fontSize: 13, marginTop: 2 },
    
    qrSection: { alignItems: 'center', marginBottom: 30 },
    qrWrapper: { backgroundColor: '#fff', padding: 16, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
    qrImage: { width: 220, height: 220 },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
    timerText: { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600' },
    
    copyLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, paddingHorizontal: 4 },
    copyLabel: { color: theme.colors.mutedForeground, fontSize: 13, fontWeight: '700' },
    copiedFeedback: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
    copyBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 14, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    copyCode: { flex: 1, color: theme.colors.foreground, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '600' },
    copyActionBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    
    instructions: { marginBottom: 30, paddingHorizontal: 4 },
    instructionTitle: { color: theme.colors.foreground, fontSize: 14, fontWeight: '800', marginBottom: 12 },
    instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
    instructionText: { color: theme.colors.mutedForeground, fontSize: 13, lineHeight: 18 },
    
    confirmBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    confirmBtnText: { color: theme.colors.mutedForeground, fontSize: 14, fontWeight: '800' },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyTitle: { color: theme.colors.foreground, fontSize: 24, fontWeight: '900', marginBottom: 12 },
    emptySub: { color: theme.colors.mutedForeground, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    emptyBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
    emptyBtnText: { color: theme.colors.primaryForeground, fontWeight: '900', fontSize: 15 },
});
