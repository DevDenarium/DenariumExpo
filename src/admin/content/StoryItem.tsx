import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EducationalContent } from '../../modules/educational/EducationalScreen.types';
import { styles } from '../../modules/educational/EducationalScreen.styles';
import { EducationalService } from '../../services/educational.service';

interface StoryItemProps {
    item: EducationalContent;
    onPress: (processedItem: EducationalContent) => void;
}

const StoryItem: React.FC<StoryItemProps> = ({ item, onPress }) => {
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [processedItem, setProcessedItem] = useState<EducationalContent>(item);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeStory = async () => {
            try {
                setLoading(true);
                setError(null);

                // Verificar acceso al contenido
                await EducationalService.checkContentAccess(item.id);
                setHasAccess(true);

                let finalVideoUrl = item.videoUrl || '';

                // Obtener la URL firmada para S3
                if (item.videoUrl) {
                    try {
                        const signedUrl = await EducationalService.getSignedUrl(item.videoUrl);
                        finalVideoUrl = signedUrl;
                    } catch (urlError) {
                        console.error('Error obteniendo URL firmada para historia:', urlError);
                        setError('Error al cargar el contenido');
                        finalVideoUrl = item.videoUrl || '';
                    }
                }

                setProcessedItem({
                    ...item,
                    videoUrl: finalVideoUrl
                });

            } catch (err) {
                console.log('Access denied for story:', item.id, err);
                setHasAccess(false);
                setError('No tienes acceso a este contenido');
            } finally {
                setLoading(false);
            }
        };

        initializeStory();
    }, [item.id, item.videoUrl]);

    const handlePress = () => {
        if (hasAccess && !loading && !error) {
            onPress(processedItem);
        }
    };

    return (
        <TouchableOpacity style={styles.storyItem} onPress={handlePress} disabled={!hasAccess || loading || !!error}>
            {loading ? (
                <View style={[styles.storyImage, styles.storyPlaceholder]}>
                    <ActivityIndicator size="small" color="#D4AF37" />
                </View>
            ) : !hasAccess || error ? (
                <View style={[styles.storyImage, styles.storyPlaceholder]}>
                    <Icon name="lock" size={30} color="#999" />
                </View>
            ) : (
                <View style={[styles.storyImage, styles.storyPlaceholder]}>
                    <Icon name="video" size={30} color="#D4AF37" />
                </View>
            )}
            <Text style={styles.storyTitle} numberOfLines={1}>
                {item.title}
            </Text>
            {/* Indicador premium */}
            {item.isPremium && (
                <View style={styles.storyPremiumBadge}>
                    <Icon name="crown" size={12} color="#D4AF37" />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default StoryItem;
