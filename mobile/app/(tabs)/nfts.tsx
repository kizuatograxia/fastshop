import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, Dimensions, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/providers/AuthProvider';
import { useWallet } from '../../components/providers/WalletProvider';
import { CartModal } from '../../components/CartModal';
import { NFTCard } from '../../components/NFTCard';
import { ShoppingCart, Gem, TrendingUp, ChevronLeft, ChevronRight, Ticket } from 'lucide-react-native';
import { FlashList } from "@shopify/flash-list";
import { theme } from '../../lib/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { getRarityConfig } from '../../lib/rarity';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TypedFlashList = FlashList as any;

const FeaturedNFT = ({ nft, onBuy }: { nft: any, onBuy: (nft: any) => void }) => {
    const rarity = getRarityConfig(nft.raridade);
    
    return (
        <View style={s.featuredCard}>
            <LinearGradient 
                colors={['rgba(0, 255, 140, 0.05)', 'transparent']} 
                style={StyleSheet.absoluteFill} 
            />
            
            <View style={s.featuredContent}>
                <View style={s.featuredImageWrap}>
                    {nft.image ? (
                        <Image source={nft.image} style={s.featuredImage} contentFit="contain" />
                    ) : (
                        <Text style={s.featuredEmoji}>{nft.emoji}</Text>
                    )}
                </View>
                
                <View style={s.featuredInfo}>
                    <View style={[s.rarityBadge, { backgroundColor: rarity.bg, borderColor: rarity.border, borderWidth: 1 }]}>
                        <Text style={[s.rarityText, { color: rarity.color }]}>{rarity.label}</Text>
                    </View>
                    <Text style={s.featuredName}>{nft.nome}</Text>
                    
                    <View style={s.featuredPriceRow}>
                        <View style={s.priceInfo}>
                            <Ticket size={18} color={theme.colors.success} />
                            <Text style={s.featuredPrice}>{Math.floor(nft.preco)}</Text>
                        </View>
                        
                        <TouchableOpacity style={s.featuredBuyBtn} onPress={() => onBuy(nft)}>
                            <ShoppingCart size={16} color={theme.colors.primaryForeground} />
                            <Text style={s.featuredBuyText}>Comprar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const ListHeader = React.memo(({ totalNFTs, featured, onOpenCart, onBuy }: { 
    totalNFTs: number; 
    featured: any[]; 
    onOpenCart: () => void;
    onBuy: (nft: any) => void;
}) => (
    <View style={s.headerContainer}>
        <SafeAreaView edges={['top']} style={s.safeArea} />
        <View style={s.header}>
            <View style={s.headerLeft}>
                <View style={s.gemBadge}>
                    <Gem size={18} color={theme.colors.primary} />
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
                <ShoppingCart size={16} color={theme.colors.primaryForeground} />
                {totalNFTs > 0 && (
                    <View style={s.cartBadge}>
                        <Text style={s.cartBadgeText}>{totalNFTs}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        {featured.length > 0 && (
            <View style={s.featuredSection}>
                <View style={s.sectionHeader}>
                    <TrendingUp size={16} color={theme.colors.primary} />
                    <Text style={s.sectionTitle}>Em Destaque</Text>
                </View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    snapToInterval={SCREEN_WIDTH - 32}
                    decelerationRate="fast"
                    contentContainerStyle={s.featuredScroll}
                >
                    {featured.map(nft => (
                        <FeaturedNFT key={nft.id} nft={nft} onBuy={onBuy} />
                    ))}
                </ScrollView>
            </View>
        )}

        <View style={s.marketDivider}>
            <Text style={s.marketText}>Marketplace</Text>
            <View style={s.dividerLine} />
            <Text style={s.itemCount}>Explorar Todos</Text>
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

    const featured = useMemo(() => {
        return [...nfts].sort((a, b) => b.preco - a.preco).slice(0, 3);
    }, [nfts]);

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
                ListHeaderComponent={
                    <ListHeader 
                        totalNFTs={cartCount} 
                        featured={featured} 
                        onOpenCart={openCart} 
                        onBuy={handleBuy}
                    />
                }
                contentContainerStyle={[s.grid, { paddingBottom: 100 }]}
                estimatedItemSize={230}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={s.loadingContainer}>
                            <Text style={s.loadingText}>Carregando coleção...</Text>
                        </View>
                    ) : null
                }
            />
            <CartModal visible={cartVisible} onClose={closeCart} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    headerContainer: { backgroundColor: 'transparent' },
    safeArea: { backgroundColor: 'transparent' },
    header: {
        paddingHorizontal: 16,
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
        backgroundColor: 'rgba(0, 255, 140, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 140, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: theme.colors.foreground,
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    headerSub: { color: theme.colors.mutedForeground, fontSize: 11 },
    
    // Featured
    featuredSection: { marginTop: 8, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
    sectionTitle: { color: theme.colors.foreground, fontSize: 16, fontWeight: '800' },
    featuredScroll: { paddingHorizontal: 16, gap: 12 },
    featuredCard: {
        width: SCREEN_WIDTH - 32,
        height: 160,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 140, 0.2)',
        overflow: 'hidden',
    },
    featuredContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    featuredImageWrap: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredImage: { width: '80%', height: '80%' },
    featuredEmoji: { fontSize: 40 },
    featuredInfo: { flex: 1, justifyContent: 'center' },
    featuredName: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800', marginBottom: 8 },
    featuredPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    priceInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    featuredPrice: { color: theme.colors.primary, fontSize: 18, fontWeight: '900' },
    featuredBuyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    featuredBuyText: { color: theme.colors.primaryForeground, fontSize: 12, fontWeight: '800' },
    rarityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 6,
    },
    rarityText: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
    },

    // Marketplace
    marketDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    marketText: {
        color: theme.colors.foreground,
        fontSize: 18,
        fontWeight: '800',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    itemCount: { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600' },

    grid: { paddingHorizontal: 10, paddingTop: 4 },
    loadingContainer: { height: 200, justifyContent: 'center' },
    loadingText: { color: theme.colors.mutedForeground, textAlign: 'center', fontSize: 13 },
    
    cartHeaderBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
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
        borderColor: theme.colors.background,
    },
    cartBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
});
