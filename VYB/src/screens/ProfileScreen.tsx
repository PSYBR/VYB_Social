import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { VideoPost } from '../types/video';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = width / COLUMN_COUNT;

const ProfileScreen = () => {
  const [user, setUser] = useState(auth().currentUser);
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalLikes: 0,
    totalFollowers: 0,
    totalFollowing: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserVideos();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      const snapshot = await firestore()
        .collection('videos')
        .where('userId', '==', user?.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoPost[];

      setVideos(videoList);
    } catch (error) {
      console.error('Error fetching user videos:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(user?.uid)
        .get();

      if (userDoc.exists) {
        setStats(userDoc.data()?.stats || {
          totalVideos: 0,
          totalLikes: 0,
          totalFollowers: 0,
          totalFollowing: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.signInText}>Please sign in to view your profile</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => {/* Navigate to sign in screen */}}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.displayName || 'Anonymous'}</Text>
          <Text style={styles.userId}>@{user.uid.slice(0, 8)}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {/* Navigate to settings screen */}}
        >
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalVideos}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalLikes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalFollowers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalFollowing}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={item => item.id}
        numColumns={COLUMN_COUNT}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.videosGrid}
      />

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
  signInText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  signInButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 25,
    margin: 20,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 25,
    margin: 20,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 