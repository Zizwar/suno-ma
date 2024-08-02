import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioContext } from '../App';
import SongListItem from '../components/SongListItem';
import SongDetailsModal from '../components/SongDetailsModal';

const SearchScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { handleSongSelect } = useContext(AudioContext);
  const [query, setQuery] = useState('');
  const [rankBy, setRankBy] = useState('trending');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const searchSongs = useCallback(async (resetResults = false) => {
    if (loading || (!hasMore && !resetResults)) return;
    
    setLoading(true);
    try {
      const activeSettings = await getActiveSettings();
      const response = await fetch(`https://suno.deno.dev/search?term=${encodeURIComponent(query)}&from_index=${resetResults ? 0 : page}&rank_by=${rankBy}`);
      const data = await response.json();
      
      if (data.songs.length === 0) {
        setHasMore(false);
      } else {
        setSearchResults(prevResults => resetResults ? data.songs : [...prevResults, ...data.songs]);
        setPage(prevPage => resetResults ? 20 : prevPage + 20);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
    } finally {
      setLoading(false);
    }
  }, [query, page, rankBy, loading, hasMore]);

  const handleSearch = () => {
    setPage(0);
    setHasMore(true);
    searchSongs(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      searchSongs();
    }
  };

  const handleSongPress = (song) => {
    handleSongSelect(song);
  };

  const handleSongLongPress = (song) => {
    setSelectedSong(song);
    setDetailsModalVisible(true);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.filterContainer}>
        <Button
          title={t('trending')}
          onPress={() => setRankBy('trending')}
          buttonStyle={[styles.filterButton, rankBy === 'trending' && styles.activeFilter]}
        />
        <Button
          title={t('mostRelevant')}
          onPress={() => setRankBy('most_relevant')}
          buttonStyle={[styles.filterButton, rankBy === 'most_relevant' && styles.activeFilter]}
        />
        <Button
          title={t('mostRecent')}
          onPress={() => setRankBy('most_recent')}
          buttonStyle={[styles.filterButton, rankBy === 'most_recent' && styles.activeFilter]}
        />
      </View>
      <Button title={t('search')} onPress={handleSearch} />
      
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            onPress={() => handleSongPress(item)}
            onLongPress={() => handleSongLongPress(item)}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />

      <SongDetailsModal
        visible={detailsModalVisible}
        song={selectedSong}
        onClose={() => setDetailsModalVisible(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 10,
    padding: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
  },
  activeFilter: {
    backgroundColor: '#555',
  },
  loaderContainer: {
    marginVertical: 20,
  },
});

export default SearchScreen;