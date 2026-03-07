export const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
    mitico: "from-emerald-400 to-green-600",
    celestial: "from-cyan-400 to-blue-600",
};

export const rarityLabels: Record<string, string> = {
    comum: "Comum",
    raro: "Raro",
    epico: "Épico",
    lendario: "Lendário",
    mitico: "Mítico",
    celestial: "Celestial",
};

export const rarityBadges: Record<string, string> = {
    comum: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    raro: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    epico: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    lendario: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    mitico: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    celestial: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export const getRarityConfig = (rarity: string) => {
    const safeRarity = rarity ? rarity.toLowerCase() : "comum";
    return {
        label: rarityLabels[safeRarity] || rarityLabels.comum,
        color: rarityColors[safeRarity] || rarityColors.comum,
        badge: rarityBadges[safeRarity] || rarityBadges.comum,
    };
};
