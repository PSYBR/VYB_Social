import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Video } from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import { VideoPost } from '../types/video';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchVideos = async () => {
    try {
      const snapshot = await firestore()
        .collection('videos')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoPost[];

      setVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  const renderVideo = ({ item, index }: { item: VideoPost; index: number }) => {
    const isActive = index === currentIndex;

    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={!isActive}
          muted={!isActive}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={item => item.id}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const index = Math.round(
            event.nativeEvent.contentOffset.y / height
          );
          setCurrentIndex(index);
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width,
    height,
  },
});

export default HomeScreen; 