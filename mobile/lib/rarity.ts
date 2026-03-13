export type Rarity = 'comum' | 'raro' | 'epico' | 'lendario' | 'mitico';

export const getRarityConfig = (rarity: Rarity | string) => {
    const r = (rarity || 'comum').toLowerCase();
    
    const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
        comum: {
            label: 'Comum',
            color: '#94A3B8',
            bg: 'rgba(148, 163, 184, 0.1)',
            border: 'rgba(148, 163, 184, 0.2)',
        },
        raro: {
            label: 'Raro',
            color: '#3B82F6',
            bg: 'rgba(59, 130, 246, 0.1)',
            border: 'rgba(59, 130, 246, 0.3)',
        },
        epico: {
            label: 'Épico',
            color: '#A855F7',
            bg: 'rgba(168, 85, 247, 0.1)',
            border: 'rgba(168, 85, 247, 0.3)',
        },
        lendario: {
            label: 'Lendário',
            color: '#EAB308',
            bg: 'rgba(234, 179, 8, 0.1)',
            border: 'rgba(234, 179, 8, 0.3)',
        },
        mitico: {
            label: 'Mítico',
            color: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.1)',
            border: 'rgba(239, 68, 68, 0.3)',
        },
    };

    return configs[r] || configs.comum;
};
