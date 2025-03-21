import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { VideoPost } from '../types/video';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT;

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  useEffect(() => {
    fetchHashtags();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedHashtag) {
      searchVideos();
    } else {
      setVideos([]);
    }
  }, [searchQuery, selectedHashtag]);

  const fetchHashtags = async () => {
    try {
      const snapshot = await firestore()
        .collection('videos')
        .get();

      const allHashtags = new Set<string>();
      snapshot.docs.forEach(doc => {
        const video = doc.data() as VideoPost;
        if (video.hashtags) {
          video.hashtags.forEach(tag => allHashtags.add(tag));
        }
      });

      setHashtags(Array.from(allHashtags));
    } catch (error) {
      console.error('Error fetching hashtags:', error);
    }
  };

  const searchVideos = async () => {
    try {
      let query = firestore().collection('videos');

      if (searchQuery) {
        query = query.where('description', '>=', searchQuery)
          .where('description', '<=', searchQuery + '\uf8ff');
      }

      if (selectedHashtag) {
        query = query.where('hashtags', 'array-contains', selectedHashtag);
      }

      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();

      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoPost[];

      setVideos(videoList);
    } catch (error) {
      console.error('Error searching videos:', error);
    }
  };

  const renderVideo = ({ item }: { item: VideoPost }) => (
    <TouchableOpacity style={styles.videoItem}>
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoInfo}>
        <Text style={styles.duration}>
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </Text>
        <View style={styles.stats}>
          <Icon name="favorite" size={16} color="#fff" />
          <Text style={styles.statText}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHashtag = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.hashtagItem,
        selectedHashtag === item && styles.selectedHashtag,
      ]}
      onPress={() => setSelectedHashtag(selectedHashtag === item ? null : item)}
    >
      <Text style={[
        styles.hashtagText,
        selectedHashtag === item && styles.selectedHashtagText,
      ]}>
        #{item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos or hashtags"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={hashtags}
        renderItem={renderHashtag}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hashtagsList}
      />

      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={item => item.id}
        numColumns={COLUMN_COUNT}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.videosGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  hashtagsList: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  hashtagItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedHashtag: {
    backgroundColor: '#ff4444',
  },
  hashtagText: {
    color: '#666',
  },
  selectedHashtagText: {
    color: '#fff',
  },
  videosGrid: {
    padding: 5,
  },
  videoItem: {
    width: ITEM_WIDTH - 10,
    height: ITEM_WIDTH - 10,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  duration: {
    color: '#fff',
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default SearchScreen; 