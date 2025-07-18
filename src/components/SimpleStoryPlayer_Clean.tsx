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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log('=== SimpleStoryPlayer Debug ===');
    console.log('Title:', title);
    console.log('Video URL:', videoUrl);
    console.log('Loading:', loading);

    const handleVideoReady = () => {
        setLoading(false);
        setError(null);
    };

    const handleVideoError = () => {
        setLoading(false);
        setError('Error al cargar el video');
    };

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

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Cargando historia...</Text>
                </View>
            )}

            {/* Error Overlay */}
            {error && (
                <View style={styles.errorOverlay}>
                    <Icon name="alert-circle" size={50} color="#E74C3C" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Video Player - Siempre renderizado con autoplay */}
            <View style={styles.videoContainer}>
                <SimpleWebVideoPlayer
                    videoUrl={videoUrl}
                    height={SCREEN_HEIGHT}
                    autoplay={true}
                    controls={false}
                    onVideoReady={handleVideoReady}
                />
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 15,
    },
    loadingText: {
        color: '#FFF',
        marginTop: 10,
        fontSize: 16,
    },
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 15,
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        paddingHorizontal: 30,
    },
});

export default SimpleStoryPlayer;
