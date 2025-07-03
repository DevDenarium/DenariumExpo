import React from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

interface Props {
    url: string;
    height?: number;
    autoplay?: boolean;
}

const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

const YoutubePlayerWrapper: React.FC<Props> = ({ url, height = 200, autoplay = false }) => {
    const videoId = extractYouTubeId(url);

    if (!videoId) return null;

    if (Platform.OS === 'web') {
        return (
            <iframe
                width="100%"
                height={height}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: 10 }}
            />
        );
    }

    return (
        <YoutubePlayer
            height={height}
            play={autoplay}
            videoId={videoId}
        />
    );
};

export default YoutubePlayerWrapper;
