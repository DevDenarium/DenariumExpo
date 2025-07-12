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
    fullscreen?: boolean;   // ← cuando es “Story” llega true
}

const extractYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m && m[1]) return m[1];
    }
    return null;
};

const YoutubePlayerWrapper: React.FC<Props> = ({
                                                   url,
                                                   height = 200,
                                                   width = '100%',
                                                   autoplay = false,
                                                   controls = true,
                                                   fullscreen = false,
                                               }) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
        return (
            <View style={[styles.container, { height }]}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>URL de YouTube no válida</Text>
                </View>
            </View>
        );
    }

    /* ------------------------------------------------------------------
       1️⃣  MODO “STORY”  – usamos WebView + HTML propio
       ------------------------------------------------------------------ */
    if (fullscreen) {
        /** HTML minimal que cumple autoplay + mute + inline */
        const html = `
      <!DOCTYPE html><html>
      <head>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1">
        <style>html,body{margin:0;background:#000;height:100%;}</style>
      </head>
      <body>
        <iframe
          id="player"
          width="100%" height="100%"
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>

        <script src="https://www.youtube.com/iframe_api"></script>
        <script>
          // Cuando la API esté lista, des‑silenciamos el video (ya está reproduciéndose)
          function onYouTubeIframeAPIReady(){
            const p = new YT.Player('player', {
              events:{ onReady:(e)=>{ e.target.unMute(); } }
            });
          }
        </script>
      </body>
      </html>
    `;
        return (
            <WebView
                source={{ html }}
                originWhitelist={['*']}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                style={styles.fullscreenWebView}
            />
        );
    }

    /* ------------------------------------------------------------------
       2️⃣  VISTA NORMAL  – seguimos con react-native-youtube-iframe
       ------------------------------------------------------------------ */
    return (
        <View style={[styles.container, { height }]}>
            <YoutubePlayer
                height={height}
                videoId={videoId}
                play={autoplay}
                webViewProps={{
                    allowsInlineMediaPlayback: true,
                    mediaPlaybackRequiresUserAction: Platform.OS !== 'android',
                }}
                webViewStyle={styles.webView}
                initialPlayerParams={{
                    controls: controls ? 1 : 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
    webView: { borderRadius: 10 },
    fullscreenWebView: { flex: 1, backgroundColor: '#000' },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
    },
    errorText: { color: '#721c24', fontSize: 14 },
});

export default YoutubePlayerWrapper;
