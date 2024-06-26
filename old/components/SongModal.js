import React, { useState, useEffect } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';

const SongModal = ({ visible, onClose, onSelectSong }) => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await require('../data/songs.json');
        setSongs(response);
      } catch (error) {
        console.error("Error loading songs:", error);
      }
    };

    fetchSongs();
  }, []);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Select a Song</Text>
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelectSong(item)}
            >
              <Text>{item.name}</Text>
              <Text>{item.style}</Text>
              <Text>Time: {item.time}</Text>
            </TouchableOpacity>
          )}
        />
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default SongModal;
