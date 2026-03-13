import React, { useState, useEffect } from 'react';
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
import { X, Star, Camera, Send, Trophy, Info } from 'lucide-react-native';
import { theme } from '../../lib/theme';
import { api } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface SubmitTestimonialModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const SubmitTestimonialModal = ({ visible, onClose, onSuccess }: SubmitTestimonialModalProps) => {
    const { user } = useAuth();
    const [wonRaffles, setWonRaffles] = useState<any[]>([]);
    const [loadingRaffles, setLoadingRaffles] = useState(false);
    const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [image, setImage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && user) {
            loadWonRaffles();
        }
    }, [visible, user]);

    const loadWonRaffles = async () => {
        if (!user) return;
        setLoadingRaffles(true);
        try {
            const raffles = await api.getUserRaffles(user.id);
            // Filter only raffles won by the user
            const won = raffles.filter((ur: any) => String(ur.raffle.winner_id) === String(user.id));
            setWonRaffles(won);
            if (won.length > 0) {
                setSelectedRaffleId(won[0].raffle.id);
            }
        } catch (error) {
            console.error('Failed to load won raffles', error);
        } finally {
            setLoadingRaffles(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para enviar uma foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSubmit = async () => {
        if (!selectedRaffleId || !comment || rating === 0) {
            Alert.alert('Campos obrigatórios', 'Por favor, selecione o prêmio, dê uma nota e escreva um comentário.');
            return;
        }

        setSubmitting(true);
        try {
            const raffle = wonRaffles.find(r => String(r.raffle.id) === String(selectedRaffleId))?.raffle;
            
            await api.submitTestimonial({
                userId: user?.id,
                userName: user?.name,
                userAvatar: user?.avatar || user?.picture || '',
                raffleName: raffle?.titulo || 'Sorteio',
                prizeName: raffle?.premio || 'Prêmio',
                rating,
                comment,
                photoUrl: image || user?.avatar || user?.picture || ''
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', 'Seu depoimento foi enviado e será revisado em breve!');
            
            // Reset form
            setComment('');
            setRating(0);
            setImage(null);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to submit testimonial', error);
            Alert.alert('Erro', 'Não foi possível enviar seu depoimento. Tente novamente mais tarde.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <BlurView intensity={20} tint="dark" style={s.overlay}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={s.keyboardView}
                >
                    <View style={s.container}>
                        <View style={s.header}>
                            <View>
                                <Text style={s.title}>🎉 Parabéns, {user.name.split(' ')[0]}!</Text>
                                <Text style={s.subtitle}>Compartilhe sua conquista com a comunidade</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                                <X size={20} color={theme.colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>

                        {loadingRaffles ? (
                            <View style={s.loadingBox}>
                                <ActivityIndicator color={theme.colors.primary} />
                                <Text style={s.loadingText}>Buscando seus prêmios...</Text>
                            </View>
                        ) : wonRaffles.length === 0 ? (
                            <View style={s.emptyBox}>
                                <Trophy size={48} color={theme.colors.muted} />
                                <Text style={s.emptyTitle}>Nenhum prêmio encontrado</Text>
                                <Text style={s.emptySub}>Apenas ganhadores podem enviar depoimentos no mural.</Text>
                                <TouchableOpacity style={s.emptyBtn} onPress={onClose}>
                                    <Text style={s.emptyBtnText}>Vou participar agora!</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                                <Text style={s.label}>Qual prêmio você recebeu? *</Text>
                                <View style={s.prizesGrid}>
                                    {wonRaffles.map((ur) => (
                                        <TouchableOpacity 
                                            key={ur.raffle.id}
                                            style={[
                                                s.prizeCard, 
                                                selectedRaffleId === ur.raffle.id && s.prizeCardSelected
                                            ]}
                                            onPress={() => setSelectedRaffleId(ur.raffle.id)}
                                        >
                                            <Image source={ur.raffle.imagem} style={s.prizeIcon} contentFit="cover" />
                                            <Text 
                                                style={[s.prizeName, selectedRaffleId === ur.raffle.id && s.prizeNameSelected]}
                                                numberOfLines={1}
                                            >
                                                {ur.raffle.titulo}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={s.label}>Sua avaliação *</Text>
                                <View style={s.starsRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity 
                                            key={star} 
                                            onPress={() => {
                                                setRating(star);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            <Star 
                                                size={36} 
                                                color={star <= rating ? '#FACC15' : 'rgba(255,255,255,0.1)'}
                                                fill={star <= rating ? '#FACC15' : 'transparent'}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={s.label}>O que você achou? *</Text>
                                <TextInput
                                    style={s.input}
                                    placeholder="Conte como foi receber seu prêmio..."
                                    placeholderTextColor={theme.colors.mutedForeground}
                                    multiline
                                    numberOfLines={4}
                                    value={comment}
                                    onChangeText={setComment}
                                    maxLength={500}
                                />
                                <Text style={s.charCount}>{comment.length}/500</Text>

                                <Text style={s.label}>Foto com o prêmio (Opcional)</Text>
                                <TouchableOpacity style={s.imagePicker} onPress={pickImage} activeOpacity={0.7}>
                                    {image ? (
                                        <View style={s.imagePreviewWrap}>
                                            <Image source={image} style={s.imagePreview} contentFit="cover" />
                                            <TouchableOpacity style={s.removeImage} onPress={() => setImage(null)}>
                                                <X size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={s.imagePickerInner}>
                                            <Camera size={24} color={theme.colors.mutedForeground} />
                                            <Text style={s.imagePickerText}>Tirar foto ou escolher da galeria</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <View style={s.infoBox}>
                                    <Info size={14} color={theme.colors.mutedForeground} />
                                    <Text style={s.infoText}>
                                        Seu depoimento será analisado por nossa equipe antes de ser publicado.
                                    </Text>
                                </View>
                            </ScrollView>
                        )}

                        <View style={s.footer}>
                            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                                <Text style={s.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[s.submitBtn, (!selectedRaffleId || !comment || rating === 0 || submitting) && s.submitBtnDisabled]} 
                                onPress={handleSubmit}
                                disabled={submitting || !selectedRaffleId || !comment || rating === 0}
                            >
                                {submitting ? (
                                    <ActivityIndicator color={theme.colors.primaryForeground} size="small" />
                                ) : (
                                    <>
                                        <Send size={16} color={theme.colors.primaryForeground} />
                                        <Text style={s.submitText}>Enviar Depoimento</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    keyboardView: { flex: 1, justifyContent: 'flex-end' },
    container: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        paddingTop: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: { color: theme.colors.foreground, fontSize: 20, fontWeight: '900' },
    subtitle: { color: theme.colors.mutedForeground, fontSize: 13, marginTop: 4 },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    label: { color: theme.colors.foreground, fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 16 },
    
    // Prizes Grid
    prizesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    prizeCard: {
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    prizeCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(0,255,140,0.05)',
    },
    prizeIcon: { width: 32, height: 32, borderRadius: 6 },
    prizeName: { color: theme.colors.mutedForeground, fontSize: 12, fontWeight: '600', flex: 1 },
    prizeNameSelected: { color: theme.colors.primary },

    starsRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        color: theme.colors.foreground,
        fontSize: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    charCount: { color: theme.colors.mutedForeground, fontSize: 11, textAlign: 'right', marginTop: 6 },
    
    imagePicker: {
        marginTop: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.muted,
        height: 140,
        overflow: 'hidden',
    },
    imagePickerInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    imagePickerText: { color: theme.colors.mutedForeground, fontSize: 12 },
    imagePreviewWrap: { flex: 1 },
    imagePreview: { width: '100%', height: '100%' },
    removeImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 12,
        borderRadius: 12,
        marginTop: 24,
    },
    infoText: { color: theme.colors.mutedForeground, fontSize: 12, flex: 1 },

    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    cancelBtn: { flex: 1, height: 50, alignItems: 'center', justifyContent: 'center' },
    cancelText: { color: theme.colors.mutedForeground, fontSize: 15, fontWeight: '600' },
    submitBtn: {
        flex: 2,
        height: 50,
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: { color: theme.colors.primaryForeground, fontSize: 15, fontWeight: '800' },

    loadingBox: { padding: 40, alignItems: 'center' },
    loadingText: { color: theme.colors.mutedForeground, marginTop: 12 },
    
    emptyBox: { padding: 40, alignItems: 'center', gap: 12 },
    emptyTitle: { color: theme.colors.foreground, fontSize: 18, fontWeight: '800', marginTop: 8 },
    emptySub: { color: theme.colors.mutedForeground, fontSize: 13, textAlign: 'center', lineHeight: 20 },
    emptyBtn: { marginTop: 12, backgroundColor: 'rgba(0,255,140,0.1)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    emptyBtnText: { color: theme.colors.primary, fontWeight: '700' },
});
