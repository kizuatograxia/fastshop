import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { History } from 'lucide-react-native';
import { Image } from 'expo-image';
import { theme } from '../../lib/theme';

interface Activity {
    id: string;
    name: string;
    avatarUrl?: string;
    tickets: number;
    joinedAt?: string;
}

interface PurchaseActivityProps {
    activities?: Activity[];
}

const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'agora';

    const diffInMinutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
};

export const PurchaseActivity = ({ activities = [] }: PurchaseActivityProps) => {
    if (activities.length === 0) return null;

    return (
        <View style={s.container}>
            <View style={s.header}>
                <View style={s.headerTitle}>
                    <History size={16} color={theme.colors.primary} />
                    <Text style={s.title}>Atividade Recente</Text>
                </View>
                <View style={s.livePill}>
                    <View style={s.liveDot} />
                    <Text style={s.liveText}>Tempo real</Text>
                </View>
            </View>

            <View style={s.list}>
                {activities.map((item) => {
                    const initial = item.name?.charAt(0)?.toUpperCase() || 'P';
                    return (
                        <View key={item.id} style={s.item}>
                            {item.avatarUrl ? (
                                <Image source={{ uri: item.avatarUrl }} style={s.avatar} contentFit="cover" />
                            ) : (
                                <View style={s.avatarFallback}>
                                    <Text style={s.avatarFallbackText}>{initial}</Text>
                                </View>
                            )}

                            <View style={s.itemContent}>
                                <Text style={s.nameText} numberOfLines={1}>{item.name}</Text>
                                <Text style={s.metaText}>
                                    {item.tickets} bilhete{item.tickets !== 1 ? 's' : ''}
                                </Text>
                            </View>

                            <Text style={s.timeText}>{formatRelativeTime(item.joinedAt)}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        color: theme.colors.foreground,
        fontSize: 15,
        fontWeight: '700',
    },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.primary,
    },
    liveText: {
        color: theme.colors.mutedForeground,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    list: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.card,
    },
    avatarFallback: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,255,140,0.10)',
    },
    avatarFallbackText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: '800',
    },
    itemContent: {
        flex: 1,
    },
    nameText: {
        color: theme.colors.foreground,
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
    },
    metaText: {
        color: theme.colors.mutedForeground,
        fontSize: 11,
        fontWeight: '500',
    },
    timeText: {
        color: theme.colors.mutedForeground,
        fontSize: 11,
        fontWeight: '600',
    },
});
