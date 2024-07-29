import React, { useContext, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { AudioContext } from '../App';
import SongListItem from '../components/SongListItem';
import SongDetailsModal from '../components/SongDetailsModal';
import Player from '../components/Player';
import { fetchSongs } from '../utils/fetchSongs';

const HomeScreen = ({ navigation }) => {
  const { currentSong, isPlaying, handlePlayPause, handleSongSelect, setPlayerModalVisible } = useContext(AudioContext);
  const [songs, setSongs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setRefreshing(true);
      const data = await fetchSongs();
      setSongs(data);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading songs:', error);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadSongs();
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
        <Player 
          currentSong={currentSong} 
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onPress={() => setPlayerModalVisible(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
});

export default HomeScreen;