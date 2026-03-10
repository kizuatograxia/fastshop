import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * Ultra-Simplified High-Performance "Mempool" Background.
 * Uses real Views for the grid to ensure visibility across all versions of React Native/Svg.
 */
export const DecorativeBackground = React.memo(() => {
    // Generate static grid squares (simulated)
    // To keep it high performance, we'll only render a visible portion or use a few large areas
    const squares = useMemo(() => {
        const items = [];
        const rows = Math.ceil(height / 20);
        const cols = Math.ceil(width / 20);

        // Render a subset of squares to verify visibility
        for (let i = 0; i < 60; i++) {
            items.push({
                id: i,
                left: Math.random() * width,
                top: Math.random() * height,
                size: 16,
                opacity: 0.15 + Math.random() * 0.1, // Increased visibility
            });
        }
        return items;
    }, []);

    return (
        <View style={s.container} pointerEvents="none">
            {/* Deep Indigo-Black Base - EXPLICIT DARK COLOR */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0B12' }]} />

            {/* Simulated Mempool Grid (Direct Views for debug/visibility) */}
            {squares.map((sq) => (
                <View
                    key={sq.id}
                    style={{
                        position: 'absolute',
                        left: sq.left,
                        top: sq.top,
                        width: sq.size,
                        height: sq.size,
                        backgroundColor: '#00FF8C',
                        opacity: sq.opacity,
                        borderRadius: 2,
                    }}
                />
            ))}

            {/* Atmosphere Glows - Emerald/Cyan mix (Stronger) */}
            <LinearGradient
                colors={['rgba(0, 255, 140, 0.25)', 'transparent']}
                style={[s.glow, s.glowTopRight]}
            />
            <LinearGradient
                colors={['rgba(0, 160, 255, 0.15)', 'transparent']}
                style={[s.glow, s.glowBottomLeft]}
            />
        </View>
    );
});

const s = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0A0B12',
    },
    glow: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: (width * 1.5) / 2,
    },
    glowTopRight: {
        top: -width * 0.5,
        right: -width * 0.5,
    },
    glowBottomLeft: {
        bottom: -width * 0.6,
        left: -width * 0.6,
    }
});
