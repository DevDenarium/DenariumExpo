import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface EnhancedVideoPlayerProps {
    videoUrl: string;
    height?: number;
    autoplay?: boolean;
    controls?: boolean;
    onProgress?: (progress: number) => void;
    onVideoEnd?: () => void;
    onVideoReady?: () => void;
    onVideoPlaying?: () => void;
    onVideoPaused?: () => void;
    enableFullscreen?: boolean;
    showCustomControls?: boolean;
    isStoryMode?: boolean;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
    videoUrl,
    height = 200,
    autoplay = false,
    controls = true,
    onProgress,
    onVideoEnd,
    onVideoReady,
    onVideoPlaying,
    onVideoPaused,
    enableFullscreen = true,
    showCustomControls = false,
    isStoryMode = false,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const webViewRef = useRef<any>(null);

    const testVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    console.log('EnhancedVideoPlayer rendered with URL:', testVideoUrl);

    // HTML optimizado para videos con controles mejorados
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
                    touch-action: manipulation;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                }
                video {
                    width: 100%;
                    height: 100%;
                    ${isStoryMode ? 'object-fit: cover;' : 'object-fit: contain;'}
                    background: #000;
                    position: relative;
                }
                
                /* Botón de pantalla completa en el centro */
                .center-fullscreen {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.7);
                    border: 2px solid rgba(255,255,255,0.9);
                    border-radius: 50%;
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: white;
                    font-size: 28px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 50;
                    font-weight: bold;
                }
                
                .center-fullscreen.visible {
                    opacity: 1;
                }
                
                .center-fullscreen:hover {
                    background: rgba(0,0,0,0.9);
                    transform: translate(-50%, -50%) scale(1.1);
                    border-color: #D4AF37;
                }
                
                /* Botón de volumen en esquina superior derecha */
                .volume-toggle {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(0,0,0,0.7);
                    border: 1px solid rgba(255,255,255,0.6);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: white;
                    font-size: 20px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 50;
                }
                
                .volume-toggle.visible {
                    opacity: 0.8;
                }
                
                .volume-toggle:hover {
                    opacity: 1;
                    background: rgba(0,0,0,0.9);
                    border-color: #D4AF37;
                }
                
                /* Overlay para mostrar controles al tocar */
                .video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10;
                    background: transparent;
                    cursor: pointer;
                }
                
                /* Indicador de volumen */
                .volume-indicator {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 100;
                    pointer-events: none;
                }
                
                .volume-indicator.visible {
                    opacity: 1;
                }
            </style>
        </head>
        <body>
            <video 
                id="mainVideo"
                ${controls && !showCustomControls ? 'controls' : ''} 
                preload="auto" 
                ${autoplay ? 'autoplay muted' : ''} 
                playsinline 
                webkit-playsinline
                controlslist="nodownload"
                ${enableFullscreen ? 'allowfullscreen' : ''}
            >
                <source src="${testVideoUrl}" type="video/mp4">
                Video no compatible
            </video>
            
            <div class="video-overlay" id="videoOverlay"></div>
            
            ${enableFullscreen ? `
            <div class="center-fullscreen" id="centerFullscreen">
                ⛶
            </div>
            ` : ''}
            
            <div class="volume-toggle" id="volumeToggle">
                🔊
            </div>
            
            <div class="volume-indicator" id="volumeIndicator">
                Sonido activado
            </div>
            
            <script>
                const video = document.getElementById('mainVideo');
                const videoOverlay = document.getElementById('videoOverlay');
                const centerFullscreen = document.getElementById('centerFullscreen');
                const volumeToggle = document.getElementById('volumeToggle');
                const volumeIndicator = document.getElementById('volumeIndicator');
                
                let isPlaying = false;
                let duration = 0;
                let controlsVisible = false;
                let controlsTimeout;
                let isMuted = ${autoplay};
                
                // Configuración inicial
                video.autoplay = ${autoplay};
                video.muted = ${autoplay};
                video.loop = false;
                
                // Función para mostrar/ocultar controles
                function showControls() {
                    controlsVisible = true;
                    if (centerFullscreen) {
                        centerFullscreen.classList.add('visible');
                    }
                    if (volumeToggle) {
                        volumeToggle.classList.add('visible');
                    }
                    
                    clearTimeout(controlsTimeout);
                    controlsTimeout = setTimeout(hideControls, 3000);
                }
                
                function hideControls() {
                    if (isPlaying && !${isStoryMode}) {
                        controlsVisible = false;
                        if (centerFullscreen) {
                            centerFullscreen.classList.remove('visible');
                        }
                        if (volumeToggle) {
                            volumeToggle.classList.remove('visible');
                        }
                    }
                }
                
                function showVolumeIndicator(text) {
                    if (volumeIndicator) {
                        volumeIndicator.textContent = text;
                        volumeIndicator.classList.add('visible');
                        setTimeout(() => {
                            volumeIndicator.classList.remove('visible');
                        }, 1500);
                    }
                }
                
                function updateVolumeButton() {
                    if (volumeToggle) {
                        volumeToggle.textContent = video.muted ? '🔇' : '🔊';
                    }
                }
                
                // Event listeners del video
                video.addEventListener('loadedmetadata', () => {
                    duration = video.duration;
                    window.ReactNativeWebView?.postMessage('ready');
                    window.ReactNativeWebView?.postMessage('duration:' + duration);
                });
                
                video.addEventListener('canplay', () => {
                    window.ReactNativeWebView?.postMessage('ready');
                    if (${autoplay}) {
                        video.play().then(() => {
                            isPlaying = true;
                            window.ReactNativeWebView?.postMessage('playing');
                        }).catch(err => {
                            console.error('Autoplay failed:', err);
                            window.ReactNativeWebView?.postMessage('autoplay-failed');
                        });
                    }
                });
                
                video.addEventListener('play', () => {
                    isPlaying = true;
                    window.ReactNativeWebView?.postMessage('playing');
                });
                
                video.addEventListener('pause', () => {
                    isPlaying = false;
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
                    window.ReactNativeWebView?.postMessage('ended');
                    showControls();
                });
                
                video.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                    window.ReactNativeWebView?.postMessage('error:Video error');
                });
                
                // Pantalla completa
                function toggleFullscreen() {
                    try {
                        if (video.requestFullscreen) {
                            if (document.fullscreenElement) {
                                document.exitFullscreen();
                            } else {
                                video.requestFullscreen();
                            }
                        } else if (video.webkitRequestFullscreen) {
                            if (document.webkitFullscreenElement) {
                                document.webkitExitFullscreen();
                            } else {
                                video.webkitRequestFullscreen();
                            }
                        } else if (video.webkitEnterFullscreen) {
                            // iOS Safari
                            video.webkitEnterFullscreen();
                        } else if (video.mozRequestFullScreen) {
                            if (document.mozFullScreenElement) {
                                document.mozCancelFullScreen();
                            } else {
                                video.mozRequestFullScreen();
                            }
                        } else if (video.msRequestFullscreen) {
                            if (document.msFullscreenElement) {
                                document.msExitFullscreen();
                            } else {
                                video.msRequestFullscreen();
                            }
                        }
                        window.ReactNativeWebView?.postMessage('fullscreen-toggle');
                    } catch (err) {
                        console.error('Fullscreen error:', err);
                        // Fallback: intentar con el elemento video directamente
                        if (video.webkitEnterFullscreen) {
                            video.webkitEnterFullscreen();
                        }
                    }
                }
                
                function toggleVolume() {
                    video.muted = !video.muted;
                    isMuted = video.muted;
                    updateVolumeButton();
                    showVolumeIndicator(video.muted ? 'Sonido desactivado' : 'Sonido activado');
                    window.ReactNativeWebView?.postMessage('volume-toggle:' + !video.muted);
                }
                
                // Event listeners para controles
                if (videoOverlay) {
                    videoOverlay.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (controlsVisible) {
                            // Si los controles están visibles, pausar/reproducir
                            if (video.paused) {
                                video.play();
                                if (video.muted && ${autoplay}) {
                                    video.muted = false;
                                    updateVolumeButton();
                                    showVolumeIndicator('Sonido activado');
                                }
                            } else {
                                video.pause();
                            }
                        } else {
                            // Si los controles no están visibles, mostrarlos
                            showControls();
                        }
                    });
                }
                
                if (centerFullscreen) {
                    centerFullscreen.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                    });
                }
                
                if (volumeToggle) {
                    volumeToggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleVolume();
                    });
                }
                
                // Control desde React Native
                window.controlVideo = function(action) {
                    switch(action) {
                        case 'play':
                            video.play();
                            break;
                        case 'pause':
                            video.pause();
                            break;
                        case 'toggle':
                            if (video.paused) {
                                video.play();
                            } else {
                                video.pause();
                            }
                            break;
                        case 'unmute':
                            video.muted = false;
                            updateVolumeButton();
                            break;
                        case 'fullscreen':
                            toggleFullscreen();
                            break;
                        case 'show-controls':
                            showControls();
                            break;
                    }
                };
                
                // Escuchar mensajes desde React Native
                document.addEventListener('message', function(e) {
                    try {
                        const data = JSON.parse(e.data);
                        if (data.action === 'control') {
                            window.controlVideo(data.value);
                        }
                    } catch (err) {
                        console.log('Error parsing message:', err);
                    }
                });
                
                window.addEventListener('message', function(e) {
                    try {
                        const data = JSON.parse(e.data);
                        if (data.action === 'control') {
                            window.controlVideo(data.value);
                        }
                    } catch (err) {
                        console.log('Error parsing message:', err);
                    }
                });
                
                // Mostrar controles al cargar
                setTimeout(showControls, 500);
                
                // Actualizar botón de volumen inicial
                updateVolumeButton();
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
                    } else if (message.startsWith('volume-toggle:')) {
                        const isUnmuted = message.replace('volume-toggle:', '') === 'true';
                        console.log('Volume toggled:', isUnmuted);
                    } else if (message === 'fullscreen-toggle') {
                        console.log('Fullscreen toggled');
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

export default EnhancedVideoPlayer;
