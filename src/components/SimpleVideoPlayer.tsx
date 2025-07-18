import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// Importación condicional de react-native-video solo para móvil
let Video: any = null;
if (Platform.OS !== 'web') {
    Video = require('react-native-video').default;
}

interface SimpleVideoPlayerProps {
    videoUrl: string;
    height?: number;
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
    videoUrl,
    height = 200,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paused, setPaused] = useState(false);

    const { width } = Dimensions.get('window');

    // Para web, usar WebView con video HTML5
    if (Platform.OS === 'web') {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: #000;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    video {
                        width: 100%;
                        height: 100%;
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <video controls preload="metadata" onloadstart="window.ReactNativeWebView?.postMessage('loading')" oncanplay="window.ReactNativeWebView?.postMessage('loaded')" onerror="window.ReactNativeWebView?.postMessage('error')">
                    <source src="${videoUrl}" type="video/mp4">
                    Tu navegador no soporta el elemento video.
                </video>
            </body>
            </html>
        `;

        return (
            <View style={[styles.container, { height }]}>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D4AF37" />
                        <Text style={styles.loadingText}>Cargando video...</Text>
                    </View>
                )}
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <WebView
                    source={{ html: htmlContent }}
                    style={[styles.webVideo, { opacity: loading ? 0 : 1 }]}
                    onMessage={(event) => {
                        const message = event.nativeEvent.data;
                        if (message === 'loading') {
                            setLoading(true);
                            setError(null);
                        } else if (message === 'loaded') {
                            setLoading(false);
                        } else if (message === 'error') {
                            setLoading(false);
                            setError('Error al cargar el video');
                        }
                    }}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                />
            </View>
        );
    }

    // Para móvil, usar react-native-video
    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = (error: any) => {
        setLoading(false);
        setError('Error al cargar el video');
        console.error('Video error:', error);
    };

    // Si Video no está disponible (por ejemplo, en web sin react-native-video), usar WebView como fallback
    if (!Video) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: #000;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    video {
                        width: 100%;
                        height: 100%;
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <video controls preload="metadata" onloadstart="window.ReactNativeWebView?.postMessage('loading')" oncanplay="window.ReactNativeWebView?.postMessage('loaded')" onerror="window.ReactNativeWebView?.postMessage('error')">
                    <source src="${videoUrl}" type="video/mp4">
                    Tu navegador no soporta el elemento video.
                </video>
            </body>
            </html>
        `;

        return (
            <View style={[styles.container, { height }]}>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D4AF37" />
                        <Text style={styles.loadingText}>Cargando video...</Text>
                    </View>
                )}
                
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <WebView
                    source={{ html: htmlContent }}
                    style={[styles.webVideo, { opacity: loading ? 0 : 1 }]}
                    onMessage={(event) => {
                        const message = event.nativeEvent.data;
                        if (message === 'loading') {
                            setLoading(true);
                            setError(null);
                        } else if (message === 'loaded') {
                            setLoading(false);
                        } else if (message === 'error') {
                            setLoading(false);
                            setError('Error al cargar el video');
                        }
                    }}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { height }]}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Cargando video...</Text>
                </View>
            )}
            
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Video
                source={{ uri: videoUrl }}
                style={[styles.video, { width: width - 40 }]}
                controls={true}
                paused={paused}
                resizeMode="contain"
                onLoadStart={handleLoadStart}
                onLoad={handleLoad}
                onError={handleError}
                poster=""
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    video: {
        height: '100%',
    },
    webVideo: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 14,
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,0,0,0.1)',
        zIndex: 1,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});
