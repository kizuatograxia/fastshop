import { Tabs } from 'expo-router';
import { Home, Trophy, Layers, Star, User } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

function TabIcon({ icon: Icon, color, label, focused }: { icon: any; color: string; label: string; focused: boolean }) {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withSpring(focused ? 1.2 : 1, { mass: 0.5 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.tabItem}>
            <Animated.View style={animatedStyle}>
                <Icon size={22} color={color} />
            </Animated.View>
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
        </View>
    );
}

function CenterTabIcon({ focused }: { focused: boolean }) {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withSpring(focused ? 1.15 : 1, { damping: 10, stiffness: 100 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.centerWrapper}>
            <Animated.View style={[styles.centerBubble, focused && styles.centerBubbleActive, animatedStyle]}>
                <Home size={24} color={focused ? '#0A0B12' : '#6b7280'} />
            </Animated.View>
            <Text style={[styles.tabLabel, { color: focused ? '#00FF8C' : '#6b7280' }]}>Início</Text>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                sceneStyle: { backgroundColor: 'transparent' }
            }}
        >
            <Tabs.Screen
                name="sorteios"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={Trophy} color={color} label="Sorteios" focused={focused} />
                    ),
                    tabBarActiveTintColor: '#00FF8C',
                    tabBarInactiveTintColor: '#6b7280',
                }}
            />
            <Tabs.Screen
                name="nfts"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={Layers} color={color} label="NFTs" focused={focused} />
                    ),
                    tabBarActiveTintColor: '#00FF8C',
                    tabBarInactiveTintColor: '#6b7280',
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => <CenterTabIcon focused={focused} />,
                    tabBarActiveTintColor: '#00FF8C',
                    tabBarInactiveTintColor: '#6b7280',
                }}
            />
            <Tabs.Screen
                name="winners"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={Star} color={color} label="Ganhadores" focused={focused} />
                    ),
                    tabBarActiveTintColor: '#00FF8C',
                    tabBarInactiveTintColor: '#6b7280',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={User} color={color} label="Perfil" focused={focused} />
                    ),
                    tabBarActiveTintColor: '#00FF8C',
                    tabBarInactiveTintColor: '#6b7280',
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'rgba(10,11,18,0.92)', // Glassmorphism dark for bottom parity
        borderTopColor: 'rgba(31,41,55,0.5)',
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 0,
        paddingTop: 0,
        position: 'absolute', // Let the background flow underneath
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0, // Remove android shadow
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingTop: 8,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    centerWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        marginBottom: 4,
    },
    centerBubble: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#1a1f2e',
        borderWidth: 2,
        borderColor: '#2d3748',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20,
        shadowColor: '#00FF8C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    centerBubbleActive: {
        backgroundColor: '#00FF8C',
        borderColor: '#00FF8C',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
});
