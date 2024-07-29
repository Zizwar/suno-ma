// sunocloudv4/components/SongDetailsModal.js
import React, { useState } from 'react';
import { View, Text, Image, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Video } from 'expo-av';

const SongDetailsModal = ({ visible, song, onClose, navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!song) return null;

  const handleDownload = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + song.title + '.mp3';
      const downloadResumable = FileSystem.createDownloadResumable(
        song.audio_url,
        fileUri
      );
      const { uri } = await downloadResumable.downloadAsync();
      alert('Song downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download the song.');
    }
  };

  const handleShare = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + song.title + '.mp3';
      await FileSystem.downloadAsync(song.audio_url, fileUri);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Sharing error:', error);
      alert('Failed to share the song.');
    }
  };

  const handleVideoPlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleEdit = () => {
    onClose(); // Close the modal
    navigation.navigate('Create', { song: song }); // Navigate to Create screen with song data
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Image source={{ uri: song.image_url }} style={styles.image} />
            <Text style={styles.title}>{song.title || 'Untitled'}</Text>
            <Text style={styles.artist}>{song.display_name || 'Unknown Artist'}</Text>
            <Text style={styles.prompt}>{song.metadata?.prompt || 'No prompt'}</Text>
            <Text style={styles.metadata}>Tags: {song.metadata?.tags || 'No tags'}</Text>
            
            <View style={styles.iconButtonContainer}>
              <TouchableOpacity onPress={handleDownload} style={[styles.iconButton, styles.downloadButton]}>
                <Icon name="download" type="font-awesome" color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={[styles.iconButton, styles.shareButton]}>
                <Icon name="share" type="font-awesome" color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVideoPlayPause} style={[styles.iconButton, styles.playButton]}>
                <Icon name={isPlaying ? "pause" : "play"} type="font-awesome" color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={[styles.iconButton, styles.editButton]}>
                <Icon name="edit" type="font-awesome" color="#fff" size={20} />
              </TouchableOpacity>
            </View>

            {isPlaying && song.video_url && (
              <Video
                source={{ uri: song.video_url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay={isPlaying}
                isLooping
                style={styles.video}
              />
            )}
          </ScrollView>
          <Button title="Close" onPress={onClose} buttonStyle={styles.closeButton} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  artist: {
    fontSize: 18,
    marginBottom: 10,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 10,
  },
  metadata: {
    fontSize: 14,
    marginBottom: 20,
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
  },
  downloadButton: {
    backgroundColor: '#3498db',
  },
  shareButton: {
    backgroundColor: '#2ecc71',
  },
  playButton: {
    backgroundColor: '#e74c3c',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  video: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#95a5a6',
    marginTop: 10,
  },
});

export default SongDetailsModal;