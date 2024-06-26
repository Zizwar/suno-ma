import React, { useState, useRef } from 'react';
import { View, Text, Image, Button, Alert, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';

const SongDetailScreen = ({ route }) => {
  const { song } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const sound = useRef(new Audio.Sound());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUrl, setModalUrl] = useState('');

  const playSound = async (audioUrl) => {
    try {
      if (isPlaying) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.current.loadAsync({ uri: audioUrl });
        await sound.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const downloadAudio = async (audioUrl) => {
    try {
      const uri = FileSystem.documentDirectory + `${song.id}.mp3`;
      await FileSystem.downloadAsync(audioUrl, uri);
      Alert.alert('Download complete', `File downloaded to ${uri}`);
    } catch (error) {
      console.log('Error downloading audio file:', error);
      Alert.alert('Error', 'Failed to download audio file');
    }
  };

  const openWebView = (url) => {
    setModalUrl(url);
    setModalVisible(true);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>{song.title}</Text>
      <Text>{song.tags}</Text>
      <Text>{song.prompt}</Text>
      {song.image_url && (
        <Image
          source={{ uri: song.image_url }}
          style={{ width: '100%', height: 200, marginTop: 8 }}
        />
      )}
      {song.audio_url && (
        <Button title={isPlaying ? "Pause Audio" : "Play Audio"} onPress={() => playSound(song.audio_url)} />
      )}
      {song.video_url && (
        <Button title="Watch Video" onPress={() => openWebView(song.video_url)} />
      )}
      {song.audio_url && (
        <Button title="Download Audio" onPress={() => downloadAudio(song.audio_url)} />
      )}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <WebView source={{ uri: modalUrl }} />
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

export default SongDetailScreen;
