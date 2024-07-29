// sunocloudv4/components/SongListItem.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const SongListItem = ({ song, onPress, onLongPress, isPlaying, rightContent }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      <Image source={{ uri: song.image_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{song.title || 'Untitled'}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.display_name || 'Unknown Artist'}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {song.metadata?.tags ? song.metadata.tags.slice(0, 30) : 'No tags'}
        </Text>
      </View>
      <View style={styles.rightContent}>
        {isPlaying && <Icon name="play-arrow" type="material" color="#fff" />}
        {rightContent}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: '#888',
    fontSize: 14,
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SongListItem;