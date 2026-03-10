import { View } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { AuthProvider } from '../components/providers/AuthProvider';
import { QueryProvider } from '../components/providers/QueryProvider';
import { WalletProvider } from '../components/providers/WalletProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DecorativeBackground } from '../components/DecorativeBackground';
import "../global.css";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider value={DarkTheme}>
                <View style={{ flex: 1, backgroundColor: '#0A0B12' }}>
                    <DecorativeBackground />
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
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
                </View>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
