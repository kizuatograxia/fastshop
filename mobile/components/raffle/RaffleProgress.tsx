import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';

interface Props {
    progress: number;
    isAlmostFull: boolean;
}

export const RaffleProgress = React.memo(({ progress, isAlmostFull }: Props) => (
    <View style={s.section}>
        <View style={s.header}>
            <Text style={s.title}>Preenchimento</Text>
            <Text style={[s.pct, isAlmostFull && s.pctHot]}>{progress.toFixed(0)}%</Text>
        </View>
        <View style={s.bg}>
            <View style={[s.fill, { width: `${progress}%` as any }, isAlmostFull && s.fillHot]} />
        </View>
        {isAlmostFull && (
            <View style={s.urgency}>
                <Zap size={12} color="#f97316" />
                <Text style={s.urgencyText}>Quase esgotado — garanta sua cota!</Text>
            </View>
        )}
    </View>
));

const s = StyleSheet.create({
    section: {
        marginBottom: 20,
        backgroundColor: 'rgba(17,24,39,0.55)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(31,41,55,0.6)',
        padding: 16,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    title: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },
    pct: { color: '#00FF8C', fontSize: 13, fontWeight: '700' },
    pctHot: { color: '#f97316' },
    bg: { height: 6, backgroundColor: 'rgba(31,41,55,0.8)', borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: '#00FF8C', borderRadius: 3 },
    fillHot: { backgroundColor: '#f97316' },
    urgency: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
        backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 6,
        borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
    },
    urgencyText: { color: '#f97316', fontSize: 12, fontWeight: '600' },
});
