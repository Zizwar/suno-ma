import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const Player = ({ currentSong, isPlaying, onPlayPause, onNext, onPrevious }) => {
  if (!currentSong) return null;

  return (
    <View style={styles.player}>
      <Image source={{ uri: currentSong.image_url }} style={styles.playerImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerTitle}>{currentSong.title}</Text>
        <Text style={styles.playerArtist}>{currentSong.artist}</Text>
      </View>
      <View style={styles.playerControls}>
        <TouchableOpacity onPress={onPrevious}>
          <Icon name="skip-previous" type="material" color="#fff" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPlayPause}>
          <Icon name={isPlaying ? "pause" : "play-arrow"} type="material" color="#fff" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext}>
          <Icon name="skip-next" type="material" color="#fff" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  player: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#222', 
    padding: 10, 
    height: 60 
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
    width: 120, 
    justifyContent: 'space-between' 
  },
});

export default Player;