import RNVideoCompress from 'react-native-video-compress';
import RNFS from 'react-native-fs';

interface VideoCompressionOptions {
  quality?: 'low' | 'medium' | 'high';
  maxDuration?: number;
  maxSize?: number;
}

export const compressVideo = async (
  uri: string,
  options: VideoCompressionOptions = {}
) => {
  try {
    const defaultOptions = {
      quality: 'medium',
      maxDuration: 60,
      maxSize: 50 * 1024 * 1024, // 50MB
    };

    const compressionOptions = { ...defaultOptions, ...options };

    const result = await RNVideoCompress.compress(
      uri,
      compressionOptions
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing video:', error);
    throw error;
  }
};

export const getVideoThumbnail = async (uri: string): Promise<string> => {
  try {
    const thumbnail = await RNVideoCompress.getThumbnail(uri);
    return thumbnail.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

export const getVideoInfo = async (uri: string) => {
  try {
    const info = await RNVideoCompress.getVideoInfo(uri);
    return {
      size: info.size,
      duration: info.duration,
      width: info.width,
      height: info.height,
      bitrate: info.bitrate,
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw error;
  }
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}; 