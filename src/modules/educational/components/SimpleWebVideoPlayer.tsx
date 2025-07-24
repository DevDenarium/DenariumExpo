import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

interface SimpleWebVideoPlayerProps {
    videoUrl: string;
    height?: number;
    autoplay?: boolean;
    controls?: boolean;
    onProgress?: (progress: number) => void;
    onVideoEnd?: () => void;
    onVideoReady?: () => void;
    onVideoPlaying?: () => void;
    onVideoPaused?: () => void;
}

export const SimpleWebVideoPlayer: React.FC<SimpleWebVideoPlayerProps> = ({
    videoUrl,
    height = 200,
    autoplay = false,
    controls = true,
    onProgress,
    onVideoEnd,
    onVideoReady,
    onVideoPlaying,
    onVideoPaused,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const webViewRef = useRef<any>(null);

    // Función para enviar comandos al WebView
    const sendCommand = (command: string) => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(command);
        }
    };

    // Funciones públicas para controlar el video
    const playVideo = () => sendCommand('PLAY');
    const pauseVideo = () => sendCommand('PAUSE');
    const togglePlayPause = () => sendCommand('TOGGLE');

    // Exponer funciones para uso externo (si se necesita)
    React.useImperativeHandle(webViewRef, () => ({
        play: playVideo,
        pause: pauseVideo,
        toggle: togglePlayPause,
    }));

    // URL de prueba si no hay videoUrl válida
    const testVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    console.log('SimpleWebVideoPlayer rendered with URL:', testVideoUrl);
    console.log('Autoplay enabled:', autoplay);
    console.log('Controls enabled:', controls);

    // HTML optimizado para autoplay
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { 
                    height: 100vh; 
                    width: 100vw;
                    background: #000; 
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                    touch-action: manipulation;
                }
                .video-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #000;
                }
                video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    background: #000;
                    pointer-events: auto;
                    -webkit-user-select: none;
                    user-select: none;
                }
                .touch-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: ${controls ? '10' : '5'};
                    background: transparent;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="video-container">
                <video 
                    id="video"
                    ${controls ? 'controls' : ''} 
                    preload="metadata" 
                    ${autoplay ? 'autoplay muted' : ''}
                    playsinline 
                    webkit-playsinline
                    x-webkit-airplay="allow"
                >
                    <source src="${testVideoUrl}" type="video/mp4">
                    Video no compatible
                </video>
                ${!controls ? '<div class="touch-overlay" id="touchOverlay"></div>' : ''}
            </div>
            
            <script>
                const video = document.getElementById('video');
                const touchOverlay = document.getElementById('touchOverlay');
                let isPlaying = false;
                let duration = 0;
                const hasControls = ${controls};
                
                // Configuración condicional para autoplay
                video.autoplay = ${autoplay};
                video.muted = ${autoplay}; // Solo mutear si hay autoplay
                video.playsInline = true;
                
                // Función optimizada para reproducir
                function playVideo() {
                    if (video.paused) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                isPlaying = true;
                                window.ReactNativeWebView?.postMessage('playing');
                            }).catch(error => {
                                console.error('Play failed:', error);
                                window.ReactNativeWebView?.postMessage('autoplay-failed');
                            });
                        }
                    }
                }
                
                // Función optimizada para pausar
                function pauseVideo() {
                    if (!video.paused) {
                        video.pause();
                        isPlaying = false;
                        window.ReactNativeWebView?.postMessage('paused');
                    }
                }
                
                // Función para toggle play/pause
                function togglePlayPause() {
                    console.log('Toggle play/pause, current paused:', video.paused);
                    if (video.paused) {
                        playVideo();
                        // Desmutear si estaba muted por autoplay
                        if (video.muted && ${autoplay}) {
                            video.muted = false;
                        }
                    } else {
                        pauseVideo();
                    }
                }
                
                // Event listeners optimizados
                video.addEventListener('loadedmetadata', () => {
                    duration = video.duration;
                    window.ReactNativeWebView?.postMessage('ready');
                    window.ReactNativeWebView?.postMessage('duration:' + duration);
                    
                    // Autoplay solo si está habilitado
                    if (${autoplay}) {
                        setTimeout(playVideo, 50);
                    }
                });
                
                video.addEventListener('play', () => {
                    isPlaying = true;
                    window.ReactNativeWebView?.postMessage('playing');
                });
                
                video.addEventListener('pause', () => {
                    isPlaying = false;
                    window.ReactNativeWebView?.postMessage('paused');
                });
                
                video.addEventListener('timeupdate', () => {
                    if (duration > 0) {
                        const progress = (video.currentTime / duration) * 100;
                        window.ReactNativeWebView?.postMessage('progress:' + progress);
                    }
                });
                
                video.addEventListener('ended', () => {
                    isPlaying = false;
                    window.ReactNativeWebView?.postMessage('ended');
                });
                
                video.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                    window.ReactNativeWebView?.postMessage('error:Video error');
                });
                
                // Control táctil mejorado
                function setupTouchControls() {
                    // Si no hay controles nativos, usar overlay
                    if (touchOverlay) {
                        touchOverlay.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Touch overlay clicked');
                            togglePlayPause();
                        });
                        
                        touchOverlay.addEventListener('touchend', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Touch overlay touched');
                            togglePlayPause();
                        });
                    } else {
                        // Si hay controles nativos, interceptar clics en el video
                        video.addEventListener('click', function(e) {
                            // Solo interceptar si el clic no es en los controles nativos
                            const rect = video.getBoundingClientRect();
                            const clickY = e.clientY - rect.top;
                            const videoHeight = rect.height;
                            const controlsHeight = hasControls ? 40 : 0; // Altura aproximada de controles
                            
                            // Si el clic está en el área del video (no en controles)
                            if (clickY < videoHeight - controlsHeight) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Video area clicked');
                                togglePlayPause();
                            }
                        });
                    }
                }
                
                // Configurar controles cuando el DOM esté listo
                document.addEventListener('DOMContentLoaded', setupTouchControls);
                setTimeout(setupTouchControls, 100);
                
                // Escuchar comandos desde React Native
                window.addEventListener('message', function(event) {
                    const command = event.data;
                    console.log('Received command:', command);
                    
                    switch(command) {
                        case 'PLAY':
                            playVideo();
                            break;
                        case 'PAUSE':
                            pauseVideo();
                            break;
                        case 'TOGGLE':
                            togglePlayPause();
                            break;
                    }
                });
            </script>
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
                    <TouchableOpacity 
                        style={styles.retryButton} 
                        onPress={() => {
                            setLoading(true);
                            setError(null);
                        }}
                    >
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={styles.webView}
                onMessage={(event) => {
                    const message = event.nativeEvent.data;
                    console.log('WebView message:', message);
                    
                    if (message === 'loading') {
                        setLoading(true);
                        setError(null);
                    } else if (message === 'ready') {
                        setLoading(false);
                        setError(null);
                        onVideoReady?.();
                    } else if (message === 'playing') {
                        setIsPlaying(true);
                        setLoading(false);
                        setError(null);
                        onVideoPlaying?.();
                    } else if (message === 'paused') {
                        setIsPlaying(false);
                        onVideoPaused?.();
                    } else if (message === 'ended') {
                        setIsPlaying(false);
                        onVideoEnd?.();
                    } else if (message === 'autoplay-failed') {
                        setError('Toca para iniciar el video');
                        setLoading(false);
                    } else if (message.startsWith('progress:')) {
                        const progress = parseFloat(message.replace('progress:', ''));
                        onProgress?.(progress);
                    } else if (message.startsWith('duration:')) {
                        const duration = parseFloat(message.replace('duration:', ''));
                        console.log('Video duration:', duration);
                    } else if (message.startsWith('error:')) {
                        setLoading(false);
                        setError(message.replace('error:', ''));
                    }
                }}
                onError={() => {
                    setLoading(false);
                    setError('Error del WebView');
                }}
                javaScriptEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                mixedContentMode="compatibility"
                allowsFullscreenVideo={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={false}
                cacheEnabled={false}
                incognito={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    webView: {
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
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 5,
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
        zIndex: 5,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        paddingHorizontal: 20,
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
});

export default SimpleWebVideoPlayer;
