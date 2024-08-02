import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const getRandomColor = () => {
  const colors = ['#FFD1DC', '#BFEFFF', '#FFFACD', '#98FB98', '#DDA0DD'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const SongListItem = ({ song, onPress, onLongPress, isPlaying }) => {
  const backgroundColor = useMemo(() => getRandomColor(), [song.id]);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Image source={{ uri: song.image_url }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{song.title || 'Untitled'}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist || 'Unknown Artist'}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {song.metadata?.tags ? song.metadata.tags.slice(0, 30) : 'No tags'}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={onPress}>
        <Icon 
          name={isPlaying ? "pause" : "play-arrow"} 
          type="material" 
          color="#fff" 
          size={30}
          containerStyle={[styles.iconContainer, isPlaying ? styles.playingIconContainer : null]}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  playButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  playingIconContainer: {
    backgroundColor: '#1DB954',
  },
});

export default SongListItem;