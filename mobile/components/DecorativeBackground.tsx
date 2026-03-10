import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Rect, Defs, Pattern } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * TRUE WEB-PARITY BACKGROUND "MEMPOOL"
 * Mirrors MempoolBackground.tsx exactly:
 * - 16px squares, 2px gap (18px step)
 * - HSL(160-200, 80%, 55%) color range
 * - Pulse animation with random grid-snapped blocks
 */
export const DecorativeBackground = React.memo(() => {
    const cellSize = 16;
    const gap = 2;
    const step = cellSize + gap;

    return (
        <View style={s.container} pointerEvents="none">
            {/* Deep base matching web --background dark */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0B12' }]} />

            {/* STATIC GRID — identical to web canvas grid */}
            <View style={StyleSheet.absoluteFill}>
                <Svg width="100%" height="100%">
                    <Defs>
                        <Pattern
                            id="mempoolGrid"
                            x="0" y="0"
                            width={step}
                            height={step}
                            patternUnits="userSpaceOnUse"
                        >
                            <Rect
                                x="0" y="0"
                                width={cellSize}
                                height={cellSize}
                                fill="hsla(160, 80%, 55%, 0.05)"
                                rx={1}
                            />
                        </Pattern>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#mempoolGrid)" />
                </Svg>
            </View>

            {/* DYNAMIC PULSE — grid-snapped pulsing blocks like web */}
            <PulsingBlocks step={step} size={cellSize} />

            {/* ATMOSPHERE GLOWS — matching web primary glow */}
            <LinearGradient
                colors={['rgba(0, 255, 140, 0.12)', 'transparent']}
                style={[s.glow, s.glowTopRight]}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
            />
            <LinearGradient
                colors={['rgba(0, 160, 255, 0.08)', 'transparent']}
                style={[s.glow, s.glowBottomLeft]}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Bottom fade for tab bar readability */}
            <LinearGradient
                colors={['transparent', 'rgba(10, 11, 18, 0.8)', '#0A0B12']}
                locations={[0, 0.6, 1]}
                style={s.bottomFade}
            />
        </View>
    );
});

const PulsingBlocks = ({ step, size }: { step: number; size: number }) => (
    <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 20 }).map((_, i) => (
            <SinglePulse key={i} step={step} size={size} delay={i * 200} />
        ))}
    </View>
);

const SinglePulse = ({ step, size, delay }: { step: number; size: number; delay: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const [pos, setPos] = React.useState({ left: 0, top: 0 });

    useEffect(() => {
        const timeout = setTimeout(() => animate(), delay);
        return () => clearTimeout(timeout);
    }, []);

    const animate = () => {
        const cols = Math.floor(width / step);
        const rows = Math.floor(height / step);
        setPos({
            left: Math.floor(Math.random() * cols) * step,
            top: Math.floor(Math.random() * rows) * step,
        });

        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 0.15 + Math.random() * 0.35,
                duration: 1200 + Math.random() * 1200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 1200 + Math.random() * 1200,
                useNativeDriver: true,
            }),
        ]).start(() => animate());
    };

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                width: size,
                height: size,
                backgroundColor: '#00FF8C',
                opacity,
                borderRadius: 1,
            }}
        />
    );
};

const s = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: (width * 1.2) / 2,
    },
    glowTopRight: {
        top: -width * 0.5,
        right: -width * 0.4,
    },
    glowBottomLeft: {
        bottom: -width * 0.6,
        left: -width * 0.5,
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
    },
});
