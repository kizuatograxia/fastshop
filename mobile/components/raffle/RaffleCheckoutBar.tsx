import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    custo: number;
    joining: boolean;
    onJoin: () => void;
}

export const RaffleCheckoutBar = React.memo(({ quantity, setQuantity, custo, joining, onJoin }: Props) => (
    <View style={s.bar}>
        <View style={s.qRow}>
            <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuantity(q => Math.max(1, q - 1)); }}
                style={s.qBtn}
            >
                <Text style={s.qBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qValue}>{quantity}</Text>
            <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuantity(q => q + 1); }}
                style={s.qBtn}
            >
                <Text style={s.qBtnText}>+</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onJoin(); }}
            disabled={joining}
            style={[s.joinBtn, joining && s.joinDisabled]}
            activeOpacity={0.8}
        >
            <Text style={s.joinText}>
                {joining ? 'Processando...' : `Participar — R$ ${(custo * quantity).toFixed(2)}`}
            </Text>
        </TouchableOpacity>
    </View>
));

const s = StyleSheet.create({
    bar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, paddingBottom: 34,
        backgroundColor: 'rgba(10,11,18,0.85)',
        borderTopWidth: 1, borderTopColor: 'rgba(31,41,55,0.6)',
        backdropFilter: 'blur(20px)' as any,
    },
    qRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(17,24,39,0.7)',
        borderRadius: 14, borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
    },
    qBtn: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
    qBtnText: { color: '#f9fafb', fontSize: 20, fontWeight: '700' },
    qValue: { color: '#f9fafb', fontSize: 16, fontWeight: '800', width: 32, textAlign: 'center' },
    joinBtn: {
        flex: 1, backgroundColor: '#00FF8C', borderRadius: 14,
        height: 48, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#00FF8C', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12,
    },
    joinDisabled: { opacity: 0.5 },
    joinText: { color: '#0A0B12', fontSize: 15, fontWeight: '800' },
});
