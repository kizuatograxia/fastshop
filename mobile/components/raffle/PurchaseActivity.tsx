import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../lib/theme';
import { History, ShoppingCart } from 'lucide-react-native';

interface Activity {
    id: string;
    who: string;
    what: string;
    time: string;
}

interface PurchaseActivityProps {
    activities?: Activity[];
}

export const PurchaseActivity = ({ activities = [
    { id: '1', who: 'joão_p7...', what: 'comprou 5 cotas', time: 'Há 2 min' },
    { id: '2', who: 'amanda.ft...', what: 'comprou 10 cotas', time: 'Há 5 min' },
    { id: '3', who: 'crypto_ki...', what: 'resgatou NFT Arara', time: 'Há 12 min' },
] }: PurchaseActivityProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <History size={16} color={theme.colors.primary} />
                <Text style={styles.title}>Atividade em Tempo Real</Text>
            </View>
            <View style={styles.list}>
                {activities.map((item) => (
                    <View key={item.id} style={styles.item}>
                        <View style={styles.iconBox}>
                            <ShoppingCart size={12} color={theme.colors.mutedForeground} />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.whoText}>
                                <Text style={styles.highlight}>{item.who}</Text> {item.what}
                            </Text>
                            <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    title: {
        color: theme.colors.foreground,
        fontSize: 15,
        fontWeight: '700',
    },
    list: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 12,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
    },
    whoText: {
        color: theme.colors.mutedForeground,
        fontSize: 12,
        fontWeight: '500',
    },
    highlight: {
        color: theme.colors.foreground,
        fontWeight: '700',
    },
    timeText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 10,
        marginTop: 2,
    },
});
