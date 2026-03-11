import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
    imageUri: string;
    onBack: () => void;
}

export const RaffleHero = React.memo(({ imageUri, onBack }: Props) => (
    <View style={s.container}>
        <Image source={{ uri: imageUri }} style={s.image} resizeMode="cover" />
        <LinearGradient
            colors={['transparent', 'rgba(10,11,18,0.6)', 'rgba(10,11,18,0.95)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={s.backWrapper}>
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onBack();
                }}
                style={s.backBtn}
                activeOpacity={0.7}
            >
                <ArrowLeft size={20} color="#f9fafb" />
            </TouchableOpacity>
        </SafeAreaView>
    </View>
));

const s = StyleSheet.create({
    container: { height: 320, position: 'relative' },
    image: { width: '100%', height: '100%' },
    backWrapper: { position: 'absolute', top: 0, left: 0, right: 0 },
    backBtn: {
        margin: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(17,24,39,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
