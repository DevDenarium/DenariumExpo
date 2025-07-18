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

    // URL de prueba si no hay videoUrl válida
    const testVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    console.log('SimpleWebVideoPlayer rendered with URL:', testVideoUrl);

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
                }
                video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    background: #000;
                }
            </style>
        </head>
        <body>
            <video 
                id="video"
                ${controls ? 'controls' : ''} 
                preload="auto" 
                autoplay
                muted
                playsinline 
                webkit-playsinline
                x-webkit-airplay="allow"
            >
                <source src="${testVideoUrl}" type="video/mp4">
                Video no compatible
            </video>
            
            <script>
                const video = document.getElementById('video');
                let isPlaying = false;
                let duration = 0;
                
                // Configuración agresiva para autoplay
                video.autoplay = true;
                video.muted = true;
                video.playsInline = true;
                
                // Función para intentar reproducir
                function attemptPlay() {
                    console.log('Attempting to play video...');
                    const playPromise = video.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log('Video started playing automatically');
                            isPlaying = true;
                            window.ReactNativeWebView?.postMessage('playing');
                        }).catch(error => {
                            console.error('Autoplay failed:', error);
                            window.ReactNativeWebView?.postMessage('autoplay-failed');
                            
                            // Intentar de nuevo después de un pequeño delay
                            setTimeout(() => {
                                video.play().catch(e => {
                                    console.error('Second attempt failed:', e);
                                });
                            }, 100);
                        });
                    }
                }
                
                video.addEventListener('loadedmetadata', () => {
                    duration = video.duration;
                    console.log('Video metadata loaded, duration:', duration);
                    window.ReactNativeWebView?.postMessage('ready');
                    window.ReactNativeWebView?.postMessage('duration:' + duration);
                });
                
                video.addEventListener('loadeddata', () => {
                    console.log('Video data loaded');
                    if (${autoplay}) {
                        attemptPlay();
                    }
                });
                
                video.addEventListener('canplay', () => {
                    console.log('Video can play');
                    window.ReactNativeWebView?.postMessage('ready');
                    
                    if (${autoplay} && video.paused) {
                        attemptPlay();
                    }
                });
                
                video.addEventListener('canplaythrough', () => {
                    console.log('Video can play through');
                    if (${autoplay} && video.paused) {
                        attemptPlay();
                    }
                });
                
                video.addEventListener('play', () => {
                    console.log('Video play event');
                    isPlaying = true;
                    window.ReactNativeWebView?.postMessage('playing');
                });
                
                video.addEventListener('pause', () => {
                    console.log('Video pause event');
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
                    console.log('Video ended');
                    isPlaying = false;
                    window.ReactNativeWebView?.postMessage('ended');
                });
                
                video.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                    window.ReactNativeWebView?.postMessage('error:Video error');
                });
                
                // Control táctil
                video.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (video.paused) {
                        video.play();
                        if (video.muted) {
                            video.muted = false;
                        }
                    } else {
                        video.pause();
                    }
                });
                
                // Intentar reproducir cuando el documento esté listo
                document.addEventListener('DOMContentLoaded', () => {
                    if (${autoplay}) {
                        setTimeout(attemptPlay, 100);
                    }
                });
                
                // Intentar reproducir inmediatamente también
                if (${autoplay}) {
                    setTimeout(attemptPlay, 50);
                }
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
