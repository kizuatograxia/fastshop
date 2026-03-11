import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Ticket, Clock } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
    participantes: number;
    maxParticipantes: number;
    endDate: Date | null;
    isValidDate: boolean;
}

export const RaffleStatsBar = React.memo(({ participantes, maxParticipantes, endDate, isValidDate }: Props) => (
    <View style={s.row}>
        <StatItem icon={<Users size={14} color="#00FF8C" />} value={String(participantes)} label="Participantes" />
        <View style={s.divider} />
        <StatItem icon={<Ticket size={14} color="#00FF8C" />} value={String(maxParticipantes)} label="Cotas Totais" />
        <View style={s.divider} />
        <StatItem
            icon={<Clock size={14} color="#00FF8C" />}
            value={isValidDate ? formatDistanceToNow(endDate!, { locale: ptBR }) : '—'}
            label="Restam"
        />
    </View>
));

const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
    <View style={s.item}>
        {icon}
        <Text style={s.value} numberOfLines={1}>{value}</Text>
        <Text style={s.label}>{label}</Text>
    </View>
);

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        backgroundColor: 'rgba(17,24,39,0.55)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(31,41,55,0.6)',
        marginBottom: 20,
    },
    item: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
    value: { color: '#f9fafb', fontSize: 14, fontWeight: '800' },
    label: { color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    divider: { width: 1, backgroundColor: 'rgba(31,41,55,0.6)', marginVertical: 12 },
});
