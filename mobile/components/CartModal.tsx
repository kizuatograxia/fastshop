import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Image } from 'react-native';
import { useWallet } from './providers/WalletProvider';
import { X, Trash2, Ticket, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface CartModalProps {
    visible: boolean;
    onClose: () => void;
}

export function CartModal({ visible, onClose }: CartModalProps) {
    const { cartItems, removeFromCart, getTotalNFTs } = useWallet();
    const router = useRouter();

    const total = cartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    if (!visible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <Pressable style={s.dimmer} onPress={onClose} />

                <View style={s.content}>
                    <View style={s.header}>
                        <View style={s.headerTitleRow}>
                            <ShoppingCart size={20} color="#00FF8C" />
                            <Text style={s.title}>Meu Carrinho</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <X size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={s.list}>
                        {cartItems.length === 0 ? (
                            <View style={s.empty}>
                                <ShoppingBag size={48} color="#1f2937" />
                                <Text style={s.emptyText}>Seu carrinho está vazio</Text>
                                <Text style={s.emptySub}>Navegue pelo marketplace e escolha seus NFTs!</Text>
                            </View>
                        ) : (
                            cartItems.map((item) => (
                                <View key={item.id} style={s.item}>
                                    <LinearGradient
                                        colors={[item.cor || '#1f2937', 'rgba(10,11,18,0.8)']}
                                        style={s.itemIcon}
                                    >
                                        {item.image ? (
                                            <Image source={{ uri: item.image }} style={s.itemImage} resizeMode="contain" />
                                        ) : (
                                            <Text style={s.itemEmoji}>{item.emoji}</Text>
                                        )}
                                    </LinearGradient>

                                    <View style={s.itemInfo}>
                                        <Text style={s.itemName}>{item.nome}</Text>
                                        <Text style={s.itemQty}>x{item.quantidade}</Text>
                                    </View>

                                    <View style={s.itemPriceRow}>
                                        <Ticket size={14} color="#00FF8C" />
                                        <Text style={s.itemPrice}>{Math.floor(item.preco * item.quantidade)}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => removeFromCart(item.id)}
                                        style={s.removeBtn}
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {cartItems.length > 0 && (
                        <View style={s.footer}>
                            <View style={s.totalRow}>
                                <Text style={s.totalLabel}>Total</Text>
                                <View style={s.totalPriceRow}>
                                    <Ticket size={20} color="#00FF8C" />
                                    <Text style={s.totalValue}>{Math.floor(total)}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleCheckout} style={s.checkoutBtn}>
                                <Text style={s.checkoutText}>Finalizar Compra</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    dimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
    content: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '80%',
        minHeight: '40%',
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { color: '#f9fafb', fontSize: 20, fontWeight: '800' },
    closeBtn: { padding: 4 },
    list: { padding: 20 },
    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { color: '#f9fafb', fontSize: 18, fontWeight: '700' },
    emptySub: { color: '#6b7280', textAlign: 'center', fontSize: 13, paddingHorizontal: 40 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A0B12',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    itemIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    itemEmoji: { fontSize: 24 },
    itemImage: { width: '100%', height: '100%' },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { color: '#f9fafb', fontWeight: '700', fontSize: 14 },
    itemQty: { color: '#00FF8C', fontSize: 12, fontWeight: '700', marginTop: 2 },
    itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
    itemPrice: { color: '#f9fafb', fontWeight: '800', fontSize: 16 },
    removeBtn: { padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10 },
    footer: { padding: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1f2937' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    totalLabel: { color: '#6b7280', fontSize: 16, fontWeight: '600' },
    totalPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    totalValue: { color: '#f9fafb', fontSize: 28, fontWeight: '900' },
    checkoutBtn: {
        backgroundColor: '#00FF8C',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#00FF8C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    checkoutText: { color: '#0A0B12', fontSize: 16, fontWeight: '900' },
});
