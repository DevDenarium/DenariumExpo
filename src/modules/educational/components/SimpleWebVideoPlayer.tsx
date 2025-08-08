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
                video::-webkit-media-controls-overlay-play-button {
                    display: block;
                }
                video::-webkit-media-controls {
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                video:hover::-webkit-media-controls {
                    opacity: 1;
                }
            </style>
            <script>
                async function generarPortadaVideo(video) {
                    return new Promise((resolve, reject) => {
                        // Configurar canvas para análisis
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        const threshold = 5; // Umbral para determinar si un frame es negro
                        let isSearching = true;
                        
                        // Función para detectar si un frame es negro
                        function isBlackFrame(imageData) {
                            const data = imageData.data;
                            let totalBrightness = 0;
                            
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i];
                                const g = data[i + 1];
                                const b = data[i + 2];
                                totalBrightness += (r + g + b) / 3;
                            }
                            
                            const avgBrightness = totalBrightness / (data.length / 4);
                            return avgBrightness < threshold;
                        }
                        
                        // Función para capturar y analizar frame
                        function captureFrame() {
                            if (!isSearching) return;
                            
                            // Configurar canvas al tamaño del video
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            
                            // Dibujar frame actual
                            context.drawImage(video, 0, 0, canvas.width, canvas.height);
                            
                            // Analizar una muestra del frame (centro de la imagen)
                            const sampleSize = 100;
                            const centerX = (canvas.width - sampleSize) / 2;
                            const centerY = (canvas.height - sampleSize) / 2;
                            const imageData = context.getImageData(centerX, centerY, sampleSize, sampleSize);
                            
                            if (!isBlackFrame(imageData)) {
                                isSearching = false;
                                
                                // Comprimir la imagen
                                canvas.toBlob((blob) => {
                                    const url = URL.createObjectURL(blob);
                                    video.poster = url;
                                    resolve(url);
                                }, 'image/jpeg', 0.85); // Comprimir con calidad 0.85
                            } else if (video.currentTime < video.duration) {
                                // Avanzar 100ms y revisar siguiente frame
                                video.currentTime += 0.1;
                            } else {
                                reject(new Error('No se encontró un frame válido'));
                            }
                        }
                        
                        // Eventos del video
                        video.addEventListener('seeked', captureFrame);
                        
                        // Manejar errores
                        video.addEventListener('error', () => {
                            reject(new Error('Error al cargar el video'));
                        });
                        
                        // Iniciar búsqueda cuando el video esté listo
                        if (video.readyState >= 2) {
                            video.currentTime = 0;
                        } else {
                            video.addEventListener('loadeddata', () => {
                                video.currentTime = 0;
                            });
                        }
                    });
                }
            </script>
        </head>
        <body>
            <div class="video-container">
                <video 
                    id="video"
                    controls
                    preload="metadata" 
                    ${autoplay ? 'autoplay muted' : ''}
                    playsinline 
                    webkit-playsinline
                    x-webkit-airplay="allow"
                    poster="${videoUrl}?x-oss-process=video/snapshot,t_1000,f_jpg,ar_auto,m_fast"
                >
                    <source src="${testVideoUrl}" type="video/mp4">
                    Video no compatible
                </video>
            </div>
            
            <script>
                const video = document.getElementById('video');
                const touchOverlay = document.getElementById('touchOverlay');
                const playButton = document.getElementById('playButton');
                let isPlaying = false;
                let duration = 0;
                let hideControlsTimeout;
                const hasControls = ${controls};
                
                video.autoplay = ${autoplay};
                video.muted = ${autoplay};
                video.playsInLine = true;
                
                function showControls() {
                    if (playButton) {
                        playButton.classList.add('visible');
                        if (hideControlsTimeout) {
                            clearTimeout(hideControlsTimeout);
                        }
                        hideControlsTimeout = setTimeout(() => {
                            if (isPlaying) {
                                playButton.classList.remove('visible');
                            }
                        }, 3000);
                    }
                }
                
                function hideControls() {
                    if (playButton && isPlaying) {
                        playButton.classList.remove('visible');
                    }
                }
                
                function updatePlayButton() {
                    if (playButton) {
                        playButton.classList.toggle('paused', !video.paused);
                    }
                }
                
                function playVideo() {
                    if (video.paused) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                isPlaying = true;
                                updatePlayButton();
                                window.ReactNativeWebView?.postMessage('playing');
                                hideControls();
                            }).catch(error => {
                                console.error('Play failed:', error);
                                window.ReactNativeWebView?.postMessage('autoplay-failed');
                            });
                        }
                    }
                }
                
                function pauseVideo() {
                    if (!video.paused) {
                        video.pause();
                        isPlaying = false;
                        updatePlayButton();
                        window.ReactNativeWebView?.postMessage('paused');
                        showControls();
                    }
                }
                
                function togglePlayPause() {
                    console.log('Toggle play/pause, current paused:', video.paused);
                    if (video.paused) {
                        playVideo();
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
                    showControls();
                    
                    // Generar thumbnail automáticamente
                    generarPortadaVideo(video).then(thumbnailUrl => {
                        console.log('Thumbnail generado:', thumbnailUrl);
                    }).catch(error => {
                        console.error('Error generando thumbnail:', error);
                    });
                    
                    if (${autoplay}) {
                        setTimeout(playVideo, 50);
                    }
                });
                
                video.addEventListener('play', () => {
                    isPlaying = true;
                    updatePlayButton();
                    window.ReactNativeWebView?.postMessage('playing');
                    hideControls();
                });
                
                video.addEventListener('pause', () => {
                    isPlaying = false;
                    updatePlayButton();
                    window.ReactNativeWebView?.postMessage('paused');
                    showControls();
                });
                
                video.addEventListener('timeupdate', () => {
                    if (duration > 0) {
                        const progress = (video.currentTime / duration) * 100;
                        window.ReactNativeWebView?.postMessage('progress:' + progress);
                    }
                });
                
                video.addEventListener('ended', () => {
                    isPlaying = false;
                    updatePlayButton();
                    window.ReactNativeWebView?.postMessage('ended');
                    showControls();
                });
                
                video.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                    window.ReactNativeWebView?.postMessage('error:Video error');
                });
                
                // Control táctil mejorado
                function setupTouchControls() {
                    if (touchOverlay) {
                        touchOverlay.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Touch overlay clicked');
                            showControls();
                            togglePlayPause();
                        });
                        
                        touchOverlay.addEventListener('touchend', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Touch overlay touched');
                            showControls();
                            togglePlayPause();
                        });
                    } else {
                        video.addEventListener('click', function(e) {
                            const rect = video.getBoundingClientRect();
                            const clickY = e.clientY - rect.top;
                            const videoHeight = rect.height;
                            const controlsHeight = hasControls ? 40 : 0;
                            
                            if (clickY < videoHeight - controlsHeight) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Video area clicked');
                                showControls();
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
