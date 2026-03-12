import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { theme } from '../lib/theme';

interface CategoryNavProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.getCategories(),
    });

    if (isLoading && categories.length === 0) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 16 }} />
            </View>
        );
    }

    // Default categories if API fails or is empty
    const displayCategories = categories.length > 0 ? categories : [
        { id: 'todos', emoji: '🎯', nome: 'Todos' },
        { id: 'tech', emoji: '💻', nome: 'Tech' },
        { id: 'moda', emoji: '👗', nome: 'Moda' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {displayCategories.map((cat: any) => {
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
    container: { 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: '#0A0B12',
    },
    scroll: { paddingHorizontal: 16, gap: 10 },
    pill: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.1)', 
        backgroundColor: 'rgba(255, 255, 255, 0.03)' 
    },
    pillActive: { 
        backgroundColor: 'rgba(0, 255, 140, 0.1)', 
        borderColor: 'rgba(0, 255, 140, 0.4)' 
    },
    emoji: { fontSize: 14 },
    label: { 
        color: theme.colors.mutedForeground, 
        fontSize: 13, 
        fontWeight: '700' 
    },
    labelActive: { color: theme.colors.primary },
});
