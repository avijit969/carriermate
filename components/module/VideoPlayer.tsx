import React from 'react';
import { View } from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe";

interface VideoPlayerProps {
    content: string;
}

export default function VideoPlayer({ content }: VideoPlayerProps) {
    const getYoutubeVideoId = (url: string) => {
        if (!url) return null;
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^#&?]*)/);
        return videoIdMatch ? videoIdMatch[1] : null;
    };

    return (
        <View className="w-full bg-black">
            <YoutubePlayer
                height={220}
                play={false}
                videoId={getYoutubeVideoId(content) || undefined}
            />
        </View>
    );
}
