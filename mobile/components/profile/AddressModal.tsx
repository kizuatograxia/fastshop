import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { X, MapPin, Check } from 'lucide-react-native';
import { theme } from '../../lib/theme';
import { api } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface AddressModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddressModal = ({ visible, onClose, onSuccess }: AddressModalProps) => {
    const { user } = useAuth();
    const [address, setAddress] = useState(user?.address || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        if (!address.trim()) {
            Alert.alert('Erro', 'O endereço não pode estar vazio.');
            return;
        }

        setSubmitting(true);
        try {
            await api.updateUserAddress({ address });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update address', error);
            Alert.alert('Erro', 'Não foi possível atualizar o endereço. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <BlurView intensity={20} tint="dark" style={s.overlay}>
                <View style={s.centerView}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={s.keyboardView}
                    >
                        <View style={s.container}>
                            <View style={s.header}>
                                <View style={s.titleRow}>
                                    <MapPin size={20} color={theme.colors.primary} />
                                    <Text style={s.title}>Endereço de Entrega</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                                    <X size={20} color={theme.colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>

                            <View style={s.content}>
                                <Text style={s.instruction}>
                                    Certifique-se de que o endereço esteja correto para garantir a entrega do seu prêmio.
                                </Text>
                                
                                <TextInput
                                    style={s.input}
                                    placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                    value={address}
                                    onChangeText={setAddress}
                                    multiline
                                    numberOfLines={3}
                                />

                                <TouchableOpacity 
                                    style={[s.saveBtn, (!address.trim() || submitting) && s.saveBtnDisabled]} 
                                    onPress={handleSave}
                                    disabled={submitting || !address.trim()}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color={theme.colors.primaryForeground} size="small" />
                                    ) : (
                                        <>
                                            <Check size={18} color={theme.colors.primaryForeground} />
                                            <Text style={s.saveText}>Salvar Endereço</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </BlurView>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    centerView: { width: '100%', maxWidth: 400 },
    keyboardView: { width: '100%' },
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 4 },
    content: { padding: 20 },
    instruction: { color: theme.colors.mutedForeground, fontSize: 13, marginBottom: 20, lineHeight: 18 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 16,
        color: theme.colors.foreground,
        fontSize: 15,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        height: 54,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveText: { color: theme.colors.primaryForeground, fontSize: 16, fontWeight: '800' },
});
