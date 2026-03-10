import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/providers/AuthProvider';
import { useWallet } from '../../components/providers/WalletProvider';
import { CartModal } from '../../components/CartModal';
import { NFTCard } from '../../components/NFTCard';
import { ShoppingCart, Gem, TrendingUp } from 'lucide-react-native';
import { FlashList } from "@shopify/flash-list";

const TypedFlashList = FlashList as any;

const ListHeader = React.memo(({ totalNFTs, onOpenCart }: { totalNFTs: number; onOpenCart: () => void }) => (
    <View style={s.headerContainer}>
        <SafeAreaView edges={['top']} style={s.safeArea} />
        <View style={s.header}>
            <View style={s.headerLeft}>
                <View style={s.gemBadge}>
                    <Gem size={18} color="#00FF8C" />
                </View>
                <View>
                    <Text style={s.headerTitle}>Coleção NFT</Text>
                    <Text style={s.headerSub}>Exclusivos para sorteios</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onOpenCart}
                style={s.cartHeaderBtn}
                activeOpacity={0.7}
            >
                <ShoppingCart size={16} color="#0A0B12" />
                {totalNFTs > 0 && (
                    <View style={s.cartBadge}>
                        <Text style={s.cartBadgeText}>{totalNFTs}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        <View style={s.featuredDivider}>
            <TrendingUp size={14} color="#00FF8C" />
            <Text style={s.featuredText}>Marketplace</Text>
            <View style={s.dividerLine} />
        </View>
    </View>
));

export default function NFTsScreen() {
    const { user } = useAuth();
    const { addToCart, getTotalNFTs } = useWallet();
    const [cartVisible, setCartVisible] = useState(false);

    const { data: nfts = [], isLoading } = useQuery({
        queryKey: ['nft-catalog'],
        queryFn: api.getNFTCatalog,
        staleTime: 60000,
    });

    const handleBuy = useCallback((nft: any) => {
        if (!user) {
            Alert.alert('Login necessário', 'Entre na sua conta para adquirir NFTs.');
            return;
        }
        addToCart(nft);
    }, [user, addToCart]);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <NFTCard nft={item} onBuy={handleBuy} buying={false} />
    ), [handleBuy]);

    const openCart = useCallback(() => setCartVisible(true), []);
    const closeCart = useCallback(() => setCartVisible(false), []);
    const cartCount = getTotalNFTs();

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <TypedFlashList
                data={nfts}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.id}
                numColumns={2}
                ListHeaderComponent={<ListHeader totalNFTs={cartCount} onOpenCart={openCart} />}
                contentContainerStyle={s.grid}
                estimatedItemSize={195}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={s.loadingContainer}>
                            <Text style={s.loadingText}>Carregando coleção...</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={<View style={{ height: 100 }} />}
            />
            <CartModal visible={cartVisible} onClose={closeCart} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },
    headerContainer: { backgroundColor: 'transparent' },
    safeArea: { backgroundColor: 'transparent' },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    gemBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 255, 140, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 140, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#f9fafb',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    headerSub: { color: '#6b7280', fontSize: 11, marginTop: 1 },
    featuredDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    featuredText: {
        color: '#f9fafb',
        fontSize: 14,
        fontWeight: '700',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(31, 41, 55, 0.6)',
        marginLeft: 8,
    },
    grid: { paddingHorizontal: 6, paddingTop: 0 },
    loadingContainer: { height: 200, justifyContent: 'center' },
    loadingText: { color: '#6b7280', textAlign: 'center', fontSize: 13 },
    cartHeaderBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#00FF8C',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#0A0B12',
    },
    cartBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
});
