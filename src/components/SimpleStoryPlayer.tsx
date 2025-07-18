import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SimpleWebVideoPlayer } from './SimpleWebVideoPlayer';

interface SimpleStoryPlayerProps {
    videoUrl: string;
    title: string;
    onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SimpleStoryPlayer: React.FC<SimpleStoryPlayerProps> = ({
    videoUrl,
    title,
    onClose
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log('=== SimpleStoryPlayer Debug ===');
    console.log('Title:', title);
    console.log('Video URL:', videoUrl);
    console.log('Is Playing:', isPlaying);
    console.log('Loading:', loading);

    const handlePlayPress = () => {
        console.log('=== Play Button Pressed ===');
        console.log('Video URL to play:', videoUrl);
        
        setLoading(true);
        setTimeout(() => {
            console.log('Setting playing to true...');
            setLoading(false);
            setIsPlaying(true);
        }, 500);
    };

    if (isPlaying) {
        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Icon name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Video Player */}
                <View style={styles.videoContainer}>
                    <Text style={styles.debugText}>Loading S3 Video Player...</Text>
                    <SimpleWebVideoPlayer
                        videoUrl={videoUrl}
                        height={SCREEN_HEIGHT}
                        autoplay={true}
                        controls={true}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Icon name="close" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Preview/Play Screen */}
            <View style={styles.previewContainer}>
                <View style={styles.placeholderContainer}>
                    <Icon name="video" size={80} color="#D4AF37" />
                </View>

                {/* Play Button Overlay */}
                <View style={styles.playOverlay}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#D4AF37" />
                    ) : (
                        <TouchableOpacity 
                            style={styles.playButton}
                            onPress={handlePlayPress}
                        >
                            <Icon name="play" size={60} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>
                        Toca para reproducir la historia
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 15,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    videoContainer: {
        flex: 1,
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    placeholderContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(212, 175, 55, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    instructionsContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructionsText: {
        color: '#FFF',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        textAlign: 'center',
    },
    debugText: {
        color: '#D4AF37',
        fontSize: 14,
        textAlign: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        zIndex: 10,
    },
});

export default SimpleStoryPlayer;
