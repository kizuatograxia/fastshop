import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const STAGE_SIZE = Math.min(SCREEN_W - 32, 420);

interface Props {
    images: string[];
    activeImage: string;
    title: string;
    onSelectImage: (url: string) => void;
    onBack: () => void;
}

export const RaffleHero = React.memo(({ images, activeImage, title, onSelectImage, onBack }: Props) => {
    const galleryImages = images.length > 0 ? images : [activeImage];

    return (
        <View style={s.wrapper}>
            <View style={s.stageCard}>
                <View style={[s.stage, { height: STAGE_SIZE }]}>
                    <Image
                        source={{ uri: activeImage }}
                        style={s.image}
                        contentFit="contain"
                        transition={150}
                    />

                    <SafeAreaView edges={['top']} style={s.topBar}>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                onBack();
                            }}
                            style={s.backBtn}
                            activeOpacity={0.8}
                        >
                            <ArrowLeft size={20} color={theme.colors.foreground} />
                        </TouchableOpacity>

                        <View style={s.imageCountBadge}>
                            <Text style={s.imageCountText}>{galleryImages.findIndex((img) => img === activeImage) + 1}/{galleryImages.length}</Text>
                        </View>
                    </SafeAreaView>
                </View>

                {galleryImages.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.thumbRow}
                    >
                        {galleryImages.map((imageUrl, index) => {
                            const isActive = imageUrl === activeImage;
                            return (
                                <TouchableOpacity
                                    key={`${imageUrl}-${index}`}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        onSelectImage(imageUrl);
                                    }}
                                    style={[s.thumbBtn, isActive && s.thumbBtnActive]}
                                >
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={s.thumbImage}
                                        contentFit="cover"
                                        transition={100}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>

            <Text style={s.caption} numberOfLines={1}>{title}</Text>
        </View>
    );
});

const s = StyleSheet.create({
    wrapper: {
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    stageCard: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(17, 20, 33, 0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    stage: {
        position: 'relative',
        backgroundColor: 'rgba(7, 8, 14, 0.72)',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(7, 8, 14, 0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageCountBadge: {
        minWidth: 48,
        height: 32,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: 'rgba(7, 8, 14, 0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageCountText: {
        color: theme.colors.foreground,
        fontSize: 12,
        fontWeight: '700',
    },
    thumbRow: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 10,
    },
    thumbBtn: {
        width: 68,
        height: 68,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    thumbBtnActive: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    caption: {
        color: theme.colors.mutedForeground,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 10,
        paddingHorizontal: 4,
    },
});
