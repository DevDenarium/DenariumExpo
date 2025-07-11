// StoryItem.tsx
import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EducationalContent } from '../../modules/educational/EducationalScreen.types';
import { styles } from '../../modules/educational/EducationalScreen.styles';

interface StoryItemProps {
    item: EducationalContent;
    onPress: () => void;
}

const StoryItem: React.FC<StoryItemProps> = ({ item, onPress }) => {
    const extractYouTubeId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    };

    const videoId = item.videoUrl ? extractYouTubeId(item.videoUrl) : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

    return (
        <TouchableOpacity
            style={styles.storyItem}
            onPress={onPress}
        >
            {thumbnailUrl ? (
                <Image
                    source={{ uri: thumbnailUrl }}
                    style={styles.storyImage}
                />
            ) : (
                <View style={[styles.storyImage, styles.storyPlaceholder]}>
                    <Icon name="video-off" size={30} color="#999" />
                </View>
            )}
            <Text style={styles.storyTitle} numberOfLines={1}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );
};

export default StoryItem;
