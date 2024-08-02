import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AudioContext } from '../App';

const MiniPlayer = ({ onExpand, onClose }) => {
  const { currentSong, isPlaying, handlePlayPause, handleNext, handlePrevious } = useContext(AudioContext);

  if (!currentSong) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onExpand}>
      <View style={styles.contentContainer}>
        <Image source={{ uri: currentSong.image_url }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || 'Unknown'}</Text>
        </View>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrevious}>
          <Ionicons name="play-skip-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}>
          <Ionicons name="play-skip-forward" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artist: {
    color: '#ccc',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MiniPlayer;