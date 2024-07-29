import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem, Text, Button, Overlay, Avatar } from 'react-native-elements';
import { fetchPlaylist } from '../utils/fetchSongs';

const AdvancedSongModal = ({ visible, onClose, onSelectSong }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSongs = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const playlistId = '50e10059-137c-4d50-ade1-73c35a17e3b7';
      const data = await fetchPlaylist(playlistId, page);
      if (data.playlist_clips.length === 0) {
        setHasMore(false);
      } else {
        setSongs(prevSongs => [...prevSongs, ...data.playlist_clips.map(item => item.clip)]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    if (visible) {
      loadSongs();
    }
  }, [visible, loadSongs]);

  const renderItem = ({ item }) => (
    <ListItem bottomDivider onPress={() => onSelectSong(item)}>
      <Avatar source={{ uri: item.image_url }} />
      <ListItem.Content>
        <ListItem.Title>{item.title || 'Untitled'}</ListItem.Title>
        <ListItem.Subtitle>{Math.floor(item.metadata?.duration || 0)}s</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  return (
    <Overlay isVisible={visible} onBackdropPress={onClose} overlayStyle={styles.overlay}>
      <Text h4 style={styles.title}>Select a Song</Text>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={loadSongs}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
      <Button title="Close" onPress={onClose} buttonStyle={styles.closeButton} />
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    height: '80%',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  loaderContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default AdvancedSongModal;