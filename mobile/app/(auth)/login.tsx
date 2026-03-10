import React, { useState, useEffect } from 'react';
import {
    View, Text, Alert, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, TextInput,
} from 'react-native';
import { useAuth } from '../../components/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Sparkles } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    // Only initialize Google auth if the client ID is configured
    const [request, response, promptAsync] = Google.useAuthRequest(
        GOOGLE_CLIENT_ID
            ? {
                webClientId: GOOGLE_CLIENT_ID,
                androidClientId: GOOGLE_CLIENT_ID, // Expo Go uses web flow on Android
            }
            : null as any
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const token = response.authentication?.accessToken;
            if (token) handleGoogleToken(token);
        }
    }, [response]);

    const handleGoogleToken = async (accessToken: string) => {
        setLoading(true);
        try {
            const data = await api.googleLogin(accessToken);
            await signIn(data.user, data.token);
        } catch (err: any) {
            Alert.alert('Erro Google', err.message || 'Falha ao entrar com Google');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
            return;
        }
        setLoading(true);
        try {
            const data = await api.login(email.trim(), password);
            await signIn(data.user, data.token);
        } catch (err: any) {
            Alert.alert('Erro ao entrar', err.message || 'Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#0A0B12' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <LinearGradient
                    colors={['rgba(0,255,140,0.12)', 'transparent']}
                    style={{ paddingTop: 80, paddingBottom: 40, alignItems: 'center' }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Sparkles size={20} color="#00FF8C" />
                        <Text style={{ fontSize: 36, fontWeight: '900', color: '#00FF8C', letterSpacing: -1 }}>
                            MundoPix
                        </Text>
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 15 }}>Ativos digitais. Retornos reais.</Text>
                </LinearGradient>

                <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 40 }}>
                    {/* Google Button — only shown if client ID is set */}
                    {GOOGLE_CLIENT_ID ? (
                        <>
                            <TouchableOpacity
                                onPress={() => promptAsync()}
                                disabled={!request || loading}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    borderWidth: 1, borderColor: '#2d3748', borderRadius: 12,
                                    padding: 14, marginBottom: 24, backgroundColor: '#111827',
                                }}
                            >
                                <Text style={{ color: '#f9fafb', fontSize: 15, fontWeight: '600' }}>
                                    Entrar com Google
                                </Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#1f2937' }} />
                                <Text style={{ color: '#4b5563', fontSize: 12, fontWeight: '600' }}>OU</Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#1f2937' }} />
                            </View>
                        </>
                    ) : null}

                    {/* Email */}
                    <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>E-mail</Text>
                    <TextInput
                        value={email} onChangeText={setEmail}
                        placeholder="seu@email.com" placeholderTextColor="#4b5563"
                        autoCapitalize="none" keyboardType="email-address"
                        style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#2d3748', borderRadius: 12, padding: 14, color: '#f9fafb', fontSize: 15, marginBottom: 16 }}
                    />

                    {/* Password */}
                    <Text style={{ color: '#9ca3af', fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Senha</Text>
                    <View style={{ position: 'relative', marginBottom: 32 }}>
                        <TextInput
                            value={password} onChangeText={setPassword}
                            placeholder="••••••••" placeholderTextColor="#4b5563"
                            secureTextEntry={!showPassword}
                            style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#2d3748', borderRadius: 12, padding: 14, paddingRight: 48, color: '#f9fafb', fontSize: 15 }}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: 14 }}>
                            {showPassword ? <EyeOff size={20} color="#4b5563" /> : <Eye size={20} color="#4b5563" />}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin} disabled={loading}
                        style={{ backgroundColor: '#00FF8C', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, opacity: loading ? 0.7 : 1 }}
                    >
                        <Text style={{ color: '#0A0B12', fontSize: 16, fontWeight: '800' }}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ alignItems: 'center', padding: 12 }}>
                        <Text style={{ color: '#6b7280', fontSize: 14 }}>
                            Não tem conta? <Text style={{ color: '#00FF8C', fontWeight: '700' }}>Cadastre-se</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
