import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, DimensionValue, ViewStyle, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;
    const [viewWidth, setViewWidth] = React.useState<number>(0);

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-viewWidth, viewWidth],
    });

    const onLayout = (event: LayoutChangeEvent) => {
        setViewWidth(event.nativeEvent.layout.width);
    };

    return (
        <View
            onLayout={onLayout}
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#1E202C',
    },
});
