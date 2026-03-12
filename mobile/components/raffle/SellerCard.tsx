import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../../lib/theme';
import { BadgeCheck } from 'lucide-react-native';

interface SellerCardProps {
    seller?: {
        name: string;
        avatar: string;
        verified: boolean;
        stats: string;
    }
}

export const SellerCard = ({ seller = { 
    name: 'Mundo Pix Oficial', 
    avatar: 'https://mundopix.com/logo.png', 
    verified: true, 
    stats: 'Vendedor Diamante • 12k+ Vendas' 
} }: SellerCardProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image source={{ uri: seller.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{seller.name}</Text>
                        {seller.verified && <BadgeCheck size={14} color={theme.colors.primary} />}
                    </View>
                    <Text style={styles.stats}>{seller.stats}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    name: {
        color: theme.colors.foreground,
        fontSize: 14,
        fontWeight: '700',
    },
    stats: {
        color: theme.colors.mutedForeground,
        fontSize: 11,
        fontWeight: '500',
    },
});
