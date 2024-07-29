// suno5/screens/SearchScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text } from 'react-native';
import { searchSongs, generateLyrics } from '../utils/fetchSongs';
import SongListItem from '../components/SongListItem';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [lyrics, setLyrics] = useState('');

  const handleSearch = async () => {
    try {
      const results = await searchSongs(query, style);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching songs:', error);
    }
  };

  const handleGenerateLyrics = async () => {
    try {
      const result = await generateLyrics(query);
      setLyrics(result.lyrics);
    } catch (error) {
      console.error('Error generating lyrics:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="البحث عن الأغاني"
        value={query}
        onChangeText={setQuery}
      />
      <TextInput
        style={styles.input}
        placeholder="النمط (اختياري)"
        value={style}
        onChangeText={setStyle}
      />
      <Button title="بحث" onPress={handleSearch} />
      <Button title="إنشاء كلمات" onPress={handleGenerateLyrics} />
      
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            onPress={() => {/* Handle song selection */}}
          />
        )}
      />

      {lyrics && (
        <View style={styles.lyricsContainer}>
          <Text style={styles.lyricsTitle}>الكلمات المنشأة:</Text>
          <Text style={styles.lyrics}>{lyrics}</Text>
        </View>
      )}
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
  lyricsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 5,
  },
  lyricsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lyrics: {
    color: '#fff',
  },
});

export default SearchScreen;