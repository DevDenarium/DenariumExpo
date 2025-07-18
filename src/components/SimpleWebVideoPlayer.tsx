import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

interface SimpleWebVideoPlayerProps {
    videoUrl: string;
    height?: number;
}

export const SimpleWebVideoPlayer: React.FC<SimpleWebVideoPlayerProps> = ({
    videoUrl,
    height = 200,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // URL de prueba si no hay videoUrl válida
    const testVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    console.log('SimpleWebVideoPlayer rendered with URL:', testVideoUrl);

    // HTML simple y directo
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { 
                    height: 100%; 
                    background: #000; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                }
                video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    background: #000;
                }
            </style>
        </head>
        <body>
            <video controls preload="metadata">
                <source src="${testVideoUrl}" type="video/mp4">
                Video no compatible
            </video>
            
            <script>
                const video = document.querySelector('video');
                
                // Asegurar que NO haya autoplay
                video.autoplay = false;
                video.muted = false;
                
                video.addEventListener('loadstart', () => {
                    console.log('Video loading started');
                    window.ReactNativeWebView?.postMessage('loading');
                });
                
                video.addEventListener('loadedmetadata', () => {
                    console.log('Video metadata loaded');
                    window.ReactNativeWebView?.postMessage('ready');
                });
                
                video.addEventListener('canplay', () => {
                    console.log('Video can play');
                    window.ReactNativeWebView?.postMessage('ready');
                });
                
                video.addEventListener('error', (e) => {
                    console.error('Video error:', e);
                    window.ReactNativeWebView?.postMessage('error:Video error');
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
                    } else if (message.startsWith('error:')) {
                        setLoading(false);
                        setError(message.replace('error:', ''));
                    } else if (message.startsWith('url:')) {
                        console.log('Video URL loaded:', message.replace('url:', ''));
                    }
                }}
                onError={() => {
                    setLoading(false);
                    setError('Error del WebView');
                }}
                javaScriptEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
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
