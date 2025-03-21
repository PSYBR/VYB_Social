import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VideoFilters } from '../components/VideoFilters';
import { compressVideo, getVideoThumbnail } from '../utils/videoUtils';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const data = await cameraRef.current.startRecording();
        setVideoUri(data.uri);
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(false);
        await cameraRef.current.stopRecording();
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
      }
    }
  };

  const handleUpload = async () => {
    if (!videoUri) return;

    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'Please sign in to upload videos');
        return;
      }

      // Compress video
      const compressedUri = await compressVideo(videoUri);
      
      // Generate thumbnail
      const thumbnailUri = await getVideoThumbnail(compressedUri);

      // Upload video to Firebase Storage
      const videoRef = storage().ref(`videos/${user.uid}/${Date.now()}.mp4`);
      await videoRef.putFile(compressedUri);
      const videoUrl = await videoRef.getDownloadURL();

      // Upload thumbnail
      const thumbnailRef = storage().ref(`thumbnails/${user.uid}/${Date.now()}.jpg`);
      await thumbnailRef.putFile(thumbnailUri);
      const thumbnailUrl = await thumbnailRef.getDownloadURL();

      // Save video metadata to Firestore
      await firestore().collection('videos').add({
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        userAvatar: user.photoURL,
        videoUrl,
        thumbnailUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        filter: selectedFilter,
      });

      Alert.alert('Success', 'Video uploaded successfully!');
      setVideoUri(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video');
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.Back}
        flashMode="auto"
        focusMode="on"
      >
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVideoUri(null)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recording]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>

          {videoUri && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Icon name="check" size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <VideoFilters
          onFilterSelect={setSelectedFilter}
          selectedFilter={selectedFilter}
        />
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: '#ff4444',
  },
  recordButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  uploadButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen; 