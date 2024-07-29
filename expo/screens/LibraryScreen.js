import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Alert, RefreshControl, TouchableOpacity, TextInput, Button } from 'react-native';
import { Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongListItem from '../components/SongListItem';
import SongDetailsModal from '../components/SongDetailsModal';
import Player from '../components/Player';
import PlayerModal from '../components/PlayerModal';
import { fetchPlaylist } from '../utils/fetchSongs';
import { AudioContext } from '../App';

const LibraryScreen = ({ navigation }) => {
  const { currentSong, isPlaying, handlePlayPause, handleSongSelect } = useContext(AudioContext);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

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
      const newPlaylists = [...playlists, { id: playlistId, name: `قائمة التشغيل ${playlists.length + 1}` }];
      await AsyncStorage.setItem('playlists', JSON.stringify(newPlaylists));
      setPlaylists(newPlaylists);
      setNewPlaylistUrl('');
      Alert.alert('نجاح', 'تمت إضافة قائمة التشغيل بنجاح');
    } catch (error) {
      console.error('Error adding playlist:', error);
      Alert.alert('خطأ', 'فشل في إضافة قائمة التشغيل');
    }
  };

  const loadPlaylist = async (playlistId) => {
    try {
      setRefreshing(true);
      const data = await fetchPlaylist(playlistId);
      if (data && data.playlist_clips) {
        setSongs(data.playlist_clips.map(item => item.clip));
        setPlaylistInfo({
          name: data.name,
          description: data.description,
          user_display_name: data.user_display_name,
          image_url: data.image_url
        });
        setCurrentPlaylist(playlistId);
      } else {
        console.error('Invalid playlist data:', data);
        Alert.alert('خطأ', 'بيانات قائمة التشغيل غير صالحة');
      }
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('خطأ', 'فشل في تحميل قائمة التشغيل');
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (currentPlaylist) {
      await loadPlaylist(currentPlaylist);
    }
  };

  const handlePlaylistLongPress = (index) => {
    Alert.alert(
      'إدارة قائمة التشغيل',
      'ماذا تريد أن تفعل بهذه القائمة؟',
      [
        {
          text: 'تعديل الاسم',
          onPress: () => editPlaylistName(index),
        },
        {
          text: 'حذف',
          onPress: () => deletePlaylist(index),
          style: 'destructive',
        },
        {
          text: 'إلغاء',
          style: 'cancel',
        },
      ]
    );
  };

  const editPlaylistName = (index) => {
    Alert.prompt(
      'تعديل اسم قائمة التشغيل',
      'أدخل الاسم الجديد لقائمة التشغيل',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تعديل',
          onPress: async (newName) => {
            if (newName) {
              const updatedPlaylists = [...playlists];
              updatedPlaylists[index].name = newName;
              setPlaylists(updatedPlaylists);
              await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
            }
          },
        },
      ],
      'plain-text',
      playlists[index].name
    );
  };

  const deletePlaylist = async (index) => {
    const updatedPlaylists = playlists.filter((_, i) => i !== index);
    setPlaylists(updatedPlaylists);
    await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };

  const handleSongPress = (song) => {
    handleSongSelect(song);
  };

  const handleSongLongPress = (song) => {
    setSelectedSong(song);
    setDetailsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.addPlaylistContainer}>
          <TextInput
            style={styles.input}
            placeholder="أدخل رابط أو معرف قائمة التشغيل"
            value={newPlaylistUrl}
            onChangeText={setNewPlaylistUrl}
          />
          <Button title="إضافة قائمة تشغيل" onPress={addPlaylist} />
        </View>

        <ScrollView horizontal style={styles.playlistsContainer}>
          {playlists.map((playlist, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => loadPlaylist(playlist.id)}
              onLongPress={() => handlePlaylistLongPress(index)} 
              style={styles.playlistItem}
            >
              <Text style={styles.playlistText}>{playlist.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {playlistInfo && (
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistName}>{playlistInfo.name}</Text>
            <Text style={styles.playlistDescription}>{playlistInfo.description}</Text>
            <Text style={styles.playlistCreator}>{`بواسطة: ${playlistInfo.user_display_name}`}</Text>
          </View>
        )}

        {songs.map((song) => (
          <SongListItem
            key={song.id}
            song={song}
            onPress={() => handleSongPress(song)}
            onLongPress={() => handleSongLongPress(song)}
            isPlaying={currentSong && currentSong.id === song.id && isPlaying}
          />
        ))}
      </ScrollView>

      <SongDetailsModal
        visible={detailsModalVisible}
        song={selectedSong}
        onClose={() => setDetailsModalVisible(false)}
        navigation={navigation}
      />

      {currentSong && (
        <TouchableOpacity onPress={() => setPlayerModalVisible(true)}>
          <Player 
            currentSong={currentSong} 
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </TouchableOpacity>
      )}

      <PlayerModal
        visible={playerModalVisible}
        onClose={() => setPlayerModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    flexDirection: 'row',
    padding: 10,
  },
  playlistItem: {
    backgroundColor: '#333',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  playlistText: {
    color: '#fff',
  },
  playlistInfo: {
    padding: 10,
    backgroundColor: '#222',
    marginBottom: 10,
  },
  playlistName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playlistDescription: {
    color: '#ddd',
    fontSize: 14,
  },
  playlistCreator: {
    color: '#bbb',
    fontSize: 12,
  },
});

export default LibraryScreen;