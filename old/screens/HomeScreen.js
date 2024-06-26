import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  Text,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListItem } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [songs, setSongs] = useState([]);

  const loadSongs = async () => {
    const storedSongs = await AsyncStorage.getItem('songs');
    if (storedSongs) {
      setSongs(JSON.parse(storedSongs));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSongs();
    }, [])
  );

  const deleteSong = async (id) => {
    const updatedSongs = songs.filter((song) => song.id !== id);
    setSongs(updatedSongs);
    await AsyncStorage.setItem('songs', JSON.stringify(updatedSongs));
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Song',
      'Are you sure you want to delete this song?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteSong(id) },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem bottomDivider>
            <ListItem.Content>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SongDetail', { song: item })
                }>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle>{item.tags}</ListItem.Subtitle>
              </TouchableOpacity>
            </ListItem.Content>
            <Button
              title="Edit"
              onPress={() => navigation.navigate('AddEditSong', { song: item })}
            />
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </ListItem>
        )}
      />
      <Button
        title="Add New Song"
        onPress={() => navigation.navigate('AddEditSong')}
      />
    </View>
  );
};

export default HomeScreen;
