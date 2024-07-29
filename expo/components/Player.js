import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { AudioContext } from '../App';

const Player = ({ onPress }) => {
  const { currentSong, isPlaying, handlePlayPause, handleNext, handlePrevious } = useContext(AudioContext);

  if (!currentSong) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.player}>
      <Image source={{ uri: currentSong.image_url }} style={styles.playerImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerTitle}>{currentSong.title}</Text>
        <Text style={styles.playerArtist}>{currentSong.artist}</Text>
      </View>
      <View style={styles.playerControls}>
        <TouchableOpacity onPress={handlePrevious}>
          <Icon name="step-backward" type="font-awesome" color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Icon name={isPlaying ? "pause" : "play"} type="font-awesome" color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}>
          <Icon name="step-forward" type="font-awesome" color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  player: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#222', 
    padding: 5, 
    height: 50 
  },
  playerImage: { 
    width: 40, 
    height: 40, 
    borderRadius: 20 
  },
  playerInfo: { 
    flex: 1, 
    marginLeft: 10 
  },
  playerTitle: { 
    color: '#fff', 
    fontSize: 14 
  },
  playerArtist: { 
    color: '#888', 
    fontSize: 12 
  },
  playerControls: { 
    flexDirection: 'row', 
    width: 100, 
    justifyContent: 'space-between' 
  },
});

export default Player;