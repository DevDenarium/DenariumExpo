import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

interface UniversalVideoPlayerProps {
    videoUrl: string;
    height?: number;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
    videoUrl,
    height = 200,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); // Para forzar re-render del WebView

    useEffect(() => {
        console.log('UniversalVideoPlayer: Loading video URL:', videoUrl);
        setLoading(true);
        setError(null);
    }, [videoUrl]);

    const handleRetry = () => {
        console.log('Retrying video load...');
        setKey(prev => prev + 1);
        setLoading(true);
        setError(null);
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    height: 100%;
                    background: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                video {
                    width: 100%;
                    height: 100%;
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 8px;
                    background: #000;
                }
                .error-message {
                    color: #ff4444;
                    text-align: center;
                    padding: 20px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <video 
                id="video-player"
                controls 
                preload="metadata" 
                playsinline
                webkit-playsinline
                crossorigin="anonymous"
            >
                <source src="${videoUrl}" type="video/mp4">
                <source src="${videoUrl}" type="video/webm">
                <source src="${videoUrl}" type="video/ogg">
                <div class="error-message">
                    Tu navegador no soporta la reproducción de video.
                    <br>URL: ${videoUrl}
                </div>
            </video>
            
            <script>
                const video = document.getElementById('video-player');
                
                // Eventos de carga
                video.addEventListener('loadstart', function() {
                    console.log('Video loadstart');
                    window.ReactNativeWebView?.postMessage('loading');
                });
                
                video.addEventListener('loadedmetadata', function() {
                    console.log('Video metadata loaded');
                    window.ReactNativeWebView?.postMessage('metadata-loaded');
                });
                
                video.addEventListener('canplay', function() {
                    console.log('Video can play');
                    window.ReactNativeWebView?.postMessage('loaded');
                });
                
                video.addEventListener('canplaythrough', function() {
                    console.log('Video can play through');
                    window.ReactNativeWebView?.postMessage('ready');
                });
                
                // Eventos de error
                video.addEventListener('error', function(e) {
                    console.error('Video error:', e);
                    const error = video.error;
                    let errorMessage = 'Error desconocido';
                    
                    if (error) {
                        switch(error.code) {
                            case error.MEDIA_ERR_ABORTED:
                                errorMessage = 'Reproducción abortada';
                                break;
                            case error.MEDIA_ERR_NETWORK:
                                errorMessage = 'Error de red';
                                break;
                            case error.MEDIA_ERR_DECODE:
                                errorMessage = 'Error de decodificación';
                                break;
                            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                errorMessage = 'Formato no soportado';
                                break;
                        }
                    }
                    
                    window.ReactNativeWebView?.postMessage('error:' + errorMessage);
                });
                
                // Timeout para detectar problemas de carga
                setTimeout(function() {
                    if (video.readyState === 0) {
                        console.warn('Video timeout - no data loaded');
                        window.ReactNativeWebView?.postMessage('error:Timeout - No se pudo cargar el video');
                    }
                }, 15000); // 15 segundos timeout
                
                // Log inicial
                console.log('Video player initialized with URL:', '${videoUrl}');
                window.ReactNativeWebView?.postMessage('initialized');
            </script>
        </body>
        </html>
    `;

    return (
        <View style={[styles.container, { height }]}>
            {/* Debug info - mostrar siempre la URL */}
            <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                    Estado: {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
                </Text>
                <Text style={styles.debugText} numberOfLines={2}>
                    URL: {videoUrl}
                </Text>
            </View>
            
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Cargando video...</Text>
                </View>
            )}
            
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            <WebView
                key={key}
                source={{ html: htmlContent }}
                style={[styles.webVideo, { opacity: loading ? 0 : 1 }]}
                onMessage={(event) => {
                    const message = event.nativeEvent.data;
                    console.log('WebView message:', message);
                    
                    if (message === 'loading' || message === 'initialized') {
                        setLoading(true);
                        setError(null);
                    } else if (message === 'loaded' || message === 'ready' || message === 'metadata-loaded') {
                        setLoading(false);
                        setError(null);
                    } else if (message.startsWith('error:')) {
                        setLoading(false);
                        const errorMsg = message.replace('error:', '');
                        setError(errorMsg);
                        console.error('Video player error:', errorMsg);
                    }
                }}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:', nativeEvent);
                    setLoading(false);
                    setError('Error al cargar el reproductor de video');
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView HTTP error:', nativeEvent.statusCode);
                    setLoading(false);
                    setError(`Error HTTP: ${nativeEvent.statusCode}`);
                }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={Platform.OS === 'android'}
                mixedContentMode="compatibility"
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
        marginBottom: 10,
    },
    urlText: {
        color: '#aaa',
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#D4AF37',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    debugContainer: {
        position: 'absolute',
        top: 5,
        left: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 5,
        borderRadius: 5,
        zIndex: 2,
    },
    debugText: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'left',
    },
});
