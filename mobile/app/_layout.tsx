import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { AuthProvider } from '../components/providers/AuthProvider';
import { QueryProvider } from '../components/providers/QueryProvider';
import { WalletProvider } from '../components/providers/WalletProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DecorativeBackground } from '../components/DecorativeBackground';
import "../global.css";

// Define a theme with a transparent background to avoid flashes during navigation
const TransparentDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: 'transparent',
    },
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider value={TransparentDarkTheme}>
                <View style={s.container}>
                    {/* The Background stays outside the navigation stack for zero flicker */}
                    <DecorativeBackground />

                    <QueryProvider>
                        <AuthProvider>
                            <WalletProvider>
                                <Stack screenOptions={{
                                    headerShown: false,
                                    contentStyle: { backgroundColor: 'transparent' }
                                }}>
                                    <Stack.Screen name="index" />
                                    <Stack.Screen name="(tabs)" />
                                    <Stack.Screen name="(auth)" />
                                    <Stack.Screen name="checkout" />
                                    <Stack.Screen name="raffle/[id]" />
                                </Stack>
                            </WalletProvider>
                        </AuthProvider>
                    </QueryProvider>
                </View>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07080E',
    }
});
