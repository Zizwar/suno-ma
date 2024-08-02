import React, { useState, useEffect, useContext, useCallback } from 'react';
//import { View, ScrollView, StyleSheet, Alert, RefreshControl, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';

import { View, ScrollView, StyleSheet, Alert, RefreshControl, TouchableOpacity, TextInput, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import SongListItem from '../components/SongListItem';
import SongDetailsModal from '../components/SongDetailsModal';
import MiniPlayer from '../components/MiniPlayer';
import PlayerModal from '../components/PlayerModal';
import { fetchPlaylist } from '../utils/fetchSongs';
import { AudioContext } from '../App';

const { width } = Dimensions.get('window');

const LibraryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  
    const { currentSong, isPlaying, handlePlayPause, handleSongSelect, setPlayerModalVisible,miniPlayerVisible, setMiniPlayerVisible,  } = useContext(AudioContext);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
//const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const savedPlaylists = await AsyncStorage.getItem('playlists');
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const addPlaylist = async () => {
    try {
      let playlistId = newPlaylistUrl;
      if (newPlaylistUrl.includes('suno.ai')) {
        playlistId = newPlaylistUrl.split('/').pop();
      }
      const activeSettings = await getActiveSettings();
      const response = await fetch(`https://suno.deno.dev/playlist?id=${playlistId}&sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`);
      const data = await response.json();
      
      if (data) {
        const newPlaylist = {
          id: data.id,
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          num_total_results: data.num_total_results
        };
        const newPlaylists = [...playlists, newPlaylist];
        await AsyncStorage.setItem('playlists', JSON.stringify(newPlaylists));
        setPlaylists(newPlaylists);
        setNewPlaylistUrl('');
        Alert.alert('نجاح', 'تمت إضافة قائمة التشغيل بنجاح');
      } else {
        Alert.alert('خطأ', 'فشل في إضافة قائمة التشغيل');
      }
    } catch (error) {
      console.error('Error adding playlist:', error);
      Alert.alert('خطأ', 'فشل في إضافة قائمة التشغيل');
    }
  };

  const loadPlaylist = async (playlistId) => {
    try {
      setRefreshing(true);
      setCurrentPlaylist(playlistId);
      setPage(1);
      setHasMore(true);
      await fetchPlaylistSongs(playlistId, 1, true);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('خطأ', 'فشل في تحميل قائمة التشغيل');
      setRefreshing(false);
    }
  };

  const fetchPlaylistSongs = async (playlistId, pageNum, reset = false) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const activeSettings = await getActiveSettings();
      const data = await fetchPlaylist(playlistId, pageNum, activeSettings);
      if (data && data.playlist_clips) {
        const newSongs = data.playlist_clips.map(item => item.clip);
        setSongs(prevSongs => reset ? newSongs : [...prevSongs, ...newSongs]);
        setHasMore(newSongs.length === 20); // Assuming 20 is the page size
        setPage(prevPage => prevPage + 1);
      } else {
        console.error('Invalid playlist data:', data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (currentPlaylist) {
      await loadPlaylist(currentPlaylist);
    }
  };

  const handlePlaylistPress = (playlist) => {
    loadPlaylist(playlist.id);
  };

  const handleSongPress = (song) => {
    handleSongSelect(song);
  };

  const handleSongLongPress = (song) => {
    setSelectedSong(song);
    setDetailsModalVisible(true);
  };

  const getActiveSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        return parsedSettings.find(setting => setting.isActive);
      }
    } catch (error) {
      console.error('Error getting active settings:', error);
    }
    return null;
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity style={styles.playlistItem} onPress={() => handlePlaylistPress(item)}>
      <Icon
        name="playlist-music"
        type="material-community"
        color="#fff"
        size={50}
        containerStyle={styles.playlistIcon}
      />
      <Text style={styles.playlistTitle}>{item.name}</Text>
      <Text style={styles.playlistTracks}>{item.num_total_results} tracks</Text>
    </TouchableOpacity>
  );

  const renderSongItem = ({ item }) => (
    <SongListItem
      song={item}
      onPress={() => handleSongPress(item)}
      onLongPress={() => handleSongLongPress(item)}
      isPlaying={currentSong && currentSong.id === item.id && isPlaying}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.addPlaylistContainer}>
        <TextInput
          style={styles.input}
          placeholder="أدخل رابط أو معرف قائمة التشغيل"
          value={newPlaylistUrl}
          onChangeText={setNewPlaylistUrl}
        />
        <Button title="إضافة قائمة تشغيل" onPress={addPlaylist} />
      </View>

      <FlatList
        horizontal
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        style={styles.playlistsContainer}
      />

   <FlatList
  data={songs}
  renderItem={renderSongItem}
  keyExtractor={(item) => item.id}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  }
  onEndReached={() => currentPlaylist && fetchPlaylistSongs(currentPlaylist, page)}
  onEndReachedThreshold={0.1}
  ListFooterComponent={() => loading && <ActivityIndicator size="large" color="#1DB954" />}
/>

      <SongDetailsModal
        visible={detailsModalVisible}
        song={selectedSong}
        onClose={() => setDetailsModalVisible(false)}
        navigation={navigation}
      />

      {miniPlayerVisible && (
        <TouchableOpacity onPress={() => setPlayerModalVisible(true)}>
       
        <MiniPlayer 
          onExpand={() => setPlayerModalVisible(true)}
          onClose={() => setMiniPlayerVisible(false)}
        />
    
        </TouchableOpacity>
      )}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  addPlaylistContainer: {
    padding: 10,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 10,
    padding: 10,
  },
  playlistsContainer: {
    maxHeight: 150,
  },
  playlistItem: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
  },
  playlistIcon: {
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playlistTracks: {
    color: '#b3b3b3',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LibraryScreen;