import React, { useRef, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import WebView from 'react-native-webview';

interface Props {
    url: string;
    height?: number;
    width?: number | string;
    autoplay?: boolean;
    controls?: boolean;
    fullscreen?: boolean;
}

const extractYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
};

const YoutubePlayerWrapper: React.FC<Props> = ({
                                                   url,
                                                   height = 200,
                                                   width = '100%',
                                                   autoplay = false,
                                                   controls = true,
                                                   fullscreen = false
                                               }) => {
    const playerRef = useRef<any>(null);
    const videoId = extractYouTubeId(url);

    useEffect(() => {
        // Solución para el error de postMessage
        if (playerRef.current) {
            const originalPostMessage = playerRef.current.postMessage;
            playerRef.current.postMessage = (data: string) => {
                if (originalPostMessage) {
                    originalPostMessage.call(playerRef.current, data);
                }
            };
        }
    }, []);

    if (!videoId) {
        console.error('URL de YouTube no válida:', url);
        return (
            <View style={[styles.container, { height }]}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>URL de video no válida</Text>
                </View>
            </View>
        );
    }

    // Configuración para pantalla completa
    if (fullscreen) {
        const screenHeight = Dimensions.get('window').height;
        const screenWidth = Dimensions.get('window').width;

        return (
            <View style={styles.fullscreenContainer}>
                <YoutubePlayer
                    ref={playerRef}
                    height={screenHeight}
                    width={screenWidth}
                    play={autoplay}
                    videoId={videoId}
                    webViewProps={{
                        allowsInlineMediaPlayback: true,
                        mediaPlaybackRequiresUserAction: Platform.OS !== 'android',
                        injectedJavaScript: `
                            document.querySelector('iframe').allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
                            true;
                        `,
                    }}
                    webViewStyle={styles.fullscreenWebView}
                />
            </View>
        );
    }

    if (Platform.OS === 'web') {
        return (
            <div style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: `${height}px`,
                borderRadius: fullscreen ? 0 : 10,
                overflow: 'hidden'
            }}>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&playsinline=1&modestbranding=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <View style={[styles.container, { height }]}>
            <YoutubePlayer
                ref={playerRef}
                height={height}
                play={autoplay}
                videoId={videoId}
                webViewProps={{
                    allowsInlineMediaPlayback: true,
                    mediaPlaybackRequiresUserAction: Platform.OS !== 'android',
                    injectedJavaScript: `
                        document.querySelector('iframe').allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
                        true;
                    `,
                }}
                webViewStyle={styles.webView}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    webView: {
        borderRadius: 10,
    },
    fullscreenContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    fullscreenWebView: {
        flex: 1,
        borderRadius: 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
    },
    errorText: {
        color: '#721c24',
        fontSize: 14,
    },
});

export default YoutubePlayerWrapper;
