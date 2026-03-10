import React from 'react';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { ViewStyle, StyleSheet } from 'react-native';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function ScreenWrapper({ children, style }: ScreenWrapperProps) {
    return (
        <Animated.View
            entering={SlideInRight.duration(350)}
            exiting={SlideOutLeft.duration(250)}
            style={[styles.container, style]}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
