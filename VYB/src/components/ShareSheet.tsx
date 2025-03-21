import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Share,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  videoUrl: string;
  videoId: string;
}

const ShareSheet: React.FC<ShareSheetProps> = ({
  visible,
  onClose,
  videoUrl,
  videoId,
}) => {
  const handleShare = async (method: string) => {
    try {
      switch (method) {
        case 'native':
          await Share.share({
            message: `Check out this video on VYB! ${videoUrl}`,
            title: 'Share Video',
          });
          break;

        case 'copy':
          await Clipboard.setString(videoUrl);
          Alert.alert('Success', 'Link copied to clipboard!');
          break;

        case 'download':
          const filename = `VYB_${Date.now()}.mp4`;
          const downloadPath = Platform.select({
            ios: `${RNFS.DocumentDirectoryPath}/${filename}`,
            android: `${RNFS.DownloadDirectoryPath}/${filename}`,
          });

          if (!downloadPath) {
            Alert.alert('Error', 'Could not determine download location');
            return;
          }

          // Ensure directory exists
          const dirPath = Platform.select({
            ios: RNFS.DocumentDirectoryPath,
            android: RNFS.DownloadDirectoryPath,
          });

          if (dirPath) {
            const dirExists = await RNFS.exists(dirPath);
            if (!dirExists) {
              Alert.alert('Error', 'Download directory not found');
              return;
            }
          }

          const response = await RNFS.downloadFile({
            fromUrl: videoUrl,
            toFile: downloadPath,
          }).promise;

          if (response.statusCode === 200) {
            Alert.alert('Success', 'Video downloaded successfully!');
          } else {
            Alert.alert('Error', 'Failed to download video');
          }
          break;

        case 'report':
          const user = auth().currentUser;
          if (!user) {
            Alert.alert('Error', 'Please sign in to report videos');
            return;
          }

          await firestore().collection('reports').add({
            videoId,
            userId: user.uid,
            reason: 'inappropriate_content',
            status: 'pending',
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

          Alert.alert('Success', 'Video reported successfully');
          break;
      }
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Video</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('native')}
            >
              <Icon name="share" size={24} color="#000" />
              <Text style={styles.optionText}>Share via...</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('copy')}
            >
              <Icon name="content-copy" size={24} color="#000" />
              <Text style={styles.optionText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('download')}
            >
              <Icon name="file-download" size={24} color="#000" />
              <Text style={styles.optionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, styles.reportOption]}
              onPress={() => handleShare('report')}
            >
              <Icon name="report-problem" size={24} color="#ff4444" />
              <Text style={[styles.optionText, styles.reportText]}>
                Report Video
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  options: {
    gap: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
  },
  reportOption: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  reportText: {
    color: '#ff4444',
  },
});

export default ShareSheet; 