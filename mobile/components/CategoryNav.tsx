import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface CategoryNavProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

// Hardcoded categories — backend doesn't have a /categories endpoint
const CATEGORIES = [
    { id: 'todos', emoji: '🎯', nome: 'Todos' },
    { id: 'tech', emoji: '💻', nome: 'Tech' },
    { id: 'moda', emoji: '👗', nome: 'Moda' },
    { id: 'eletronicos', emoji: '📱', nome: 'Eletrônicos' },
    { id: 'esportes', emoji: '⚽', nome: 'Esportes' },
    { id: 'viagem', emoji: '✈️', nome: 'Viagem' },
    { id: 'games', emoji: '🎮', nome: 'Games' },
    { id: 'luxo', emoji: '💎', nome: 'Luxo' },
];

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => onCategoryChange(cat.id)}
                            style={[styles.pill, isActive && styles.pillActive]}
                        >
                            <Text style={styles.emoji}>{cat.emoji}</Text>
                            <Text style={[styles.label, isActive && styles.labelActive]}>
                                {cat.nome}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
    scroll: { paddingHorizontal: 16, gap: 8 },
    pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1f2937', backgroundColor: '#111827' },
    pillActive: { backgroundColor: 'rgba(0,255,140,0.15)', borderColor: 'rgba(0,255,140,0.5)' },
    emoji: { fontSize: 13 },
    label: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
    labelActive: { color: '#00FF8C' },
});
