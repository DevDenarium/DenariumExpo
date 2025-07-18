import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    Dimensions, 
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EducationalContent } from '../modules/educational/EducationalScreen.types';
import { SimpleWebVideoPlayer } from './SimpleWebVideoPlayer';

interface StoryViewerProps {
    stories: EducationalContent[];
    initialIndex: number;
    visible: boolean;
    onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const StoryViewer: React.FC<StoryViewerProps> = ({
    stories,
    initialIndex,
    visible,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState(0);

    const currentStory = stories[currentIndex];

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            setProgress(0);
            setError(null);
            setLoading(false);
            startProgressBar();
        } else {
            stopProgressBar();
        }

        return () => {
            stopProgressBar();
        };
    }, [visible, initialIndex]);

    const startProgressBar = () => {
        stopProgressBar();
        setProgress(0);
        
        // Duración de cada historia (5 segundos por defecto)
        const duration = 5000;
        const interval = 50;
        const increment = (interval / duration) * 100;

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    goToNext();
                    return 0;
                }
                return prev + increment;
            });
        }, interval);
    };

    const stopProgressBar = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
    };

    const goToNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
            setError(null);
            startProgressBar();
        } else {
            onClose();
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
            setError(null);
            startProgressBar();
        }
    };

    const handleTapLeft = () => {
        stopProgressBar();
        goToPrevious();
    };

    const handleTapRight = () => {
        stopProgressBar();
        goToNext();
    };

    const renderStoryContent = () => {
        console.log('=== StoryViewer Debug ===');
        console.log('Current story:', currentStory);
        console.log('Video URL:', currentStory?.videoUrl);
        console.log('Loading:', loading);
        console.log('Error:', error);
        console.log('========================');

        if (!currentStory?.videoUrl) {
            console.log('No video URL found');
            return (
                <View style={styles.errorContainer}>
                    <Icon name="video-off" size={50} color="#999" />
                    <Text style={styles.errorText}>Contenido no disponible</Text>
                </View>
            );
        }

        if (loading) {
            console.log('Showing loading state');
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Cargando historia...</Text>
                </View>
            );
        }

        if (error) {
            console.log('Showing error state:', error);
            return (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={50} color="#E74C3C" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => {
                        setError(null);
                        setLoading(false);
                    }}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        console.log('Rendering SimpleWebVideoPlayer with URL:', currentStory.videoUrl);
        return (
            <SimpleWebVideoPlayer
                videoUrl={currentStory.videoUrl}
                height={SCREEN_HEIGHT}
                autoplay={true}
                controls={false}
            />
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <StatusBar hidden />
            <View style={styles.container}>
                {/* Barra de progreso */}
                <View style={styles.progressContainer}>
                    {stories.map((_, index) => (
                        <View key={index} style={styles.progressBarBackground}>
                            <View 
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${
                                            index < currentIndex 
                                                ? 100 
                                                : index === currentIndex 
                                                ? progress 
                                                : 0
                                        }%`
                                    }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Header con título y botón cerrar */}
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {currentStory?.title || 'Historia'}
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Icon name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Contenido del video */}
                <View style={styles.contentContainer}>
                    {renderStoryContent()}
                </View>

                {/* Controles táctiles invisibles */}
                <View style={styles.touchControls}>
                    <TouchableOpacity 
                        style={styles.leftTouchArea} 
                        onPress={handleTapLeft}
                        activeOpacity={0}
                    />
                    <TouchableOpacity 
                        style={styles.rightTouchArea} 
                        onPress={handleTapRight}
                        activeOpacity={0}
                    />
                </View>

                {/* Indicadores de navegación */}
                <View style={styles.navigationIndicators}>
                    {currentIndex > 0 && (
                        <View style={styles.leftIndicator}>
                            <Icon name="chevron-left" size={30} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}
                    {currentIndex < stories.length - 1 && (
                        <View style={styles.rightIndicator}>
                            <Icon name="chevron-right" size={30} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 50,
        paddingBottom: 10,
        gap: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    progressBarBackground: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFF',
        borderRadius: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 80,
        paddingBottom: 15,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFF',
        marginTop: 10,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    touchControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 5,
    },
    leftTouchArea: {
        flex: 1,
    },
    rightTouchArea: {
        flex: 1,
    },
    navigationIndicators: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        pointerEvents: 'none',
    },
    leftIndicator: {
        alignSelf: 'flex-start',
    },
    rightIndicator: {
        alignSelf: 'flex-end',
    },
});

export default StoryViewer;
