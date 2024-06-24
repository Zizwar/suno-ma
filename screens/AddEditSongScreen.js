import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import InstrumentModal from '../components/InstrumentModal';
import StructureModal from '../components/StructureModal';
import SongModal from '../components/SongModal';

const AddEditSongScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [prompt, setPrompt] = useState('');
  const [continueClipId, setContinueClipId] = useState('');
  const [continueAt, setContinueAt] = useState('');
  const [maxTime, setMaxTime] = useState(null);
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [instrumentModalVisible, setInstrumentModalVisible] = useState(false);
  const [structureModalVisible, setStructureModalVisible] = useState(false);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [promptSelection, setPromptSelection] = useState({ start: 0, end: 0 });
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    if (route.params?.song) {
      const { song } = route.params;
      setTitle(song.title);
      setTags(song.tags);
      setPrompt(song.prompt);
      setContinueClipId(song.continue_clip_id);
      setContinueAt(song.continue_at !== null ? song.continue_at.toString() : '');
      setMakeInstrumental(song.make_instrumental);
      setMaxTime(song.continue_at);
    }
  }, [route.params]);

  const saveSong = async () => {
    const id = route.params?.song ? route.params.song.id : uuid.v4();
    const newSong = {
      id,
      title,
      tags,
      prompt,
      continue_clip_id: continueClipId,
      continue_at: parseInt(continueAt) || 0,
      make_instrumental: makeInstrumental,
    };

    const storedSongs = await AsyncStorage.getItem('songs');
    const songs = storedSongs ? JSON.parse(storedSongs) : [];

    if (route.params?.song) {
      const index = songs.findIndex(song => song.id === id);
      songs[index] = newSong;
    } else {
      songs.push(newSong);
    }

    await AsyncStorage.setItem('songs', JSON.stringify(songs));
    navigation.goBack();
  };

  const addInstrumentToPrompt = (value) => {
    const newPrompt = 
      prompt.slice(0, promptSelection.start) + value + prompt.slice(promptSelection.end);
    setPrompt(newPrompt);
    setInstrumentModalVisible(false);
  };

  const addStructureToPrompt = (value) => {
    const newPrompt = 
      prompt.slice(0, promptSelection.start) + value + prompt.slice(promptSelection.end);
    setPrompt(newPrompt);
    setStructureModalVisible(false);
  };

  const selectSong = (song) => {
    setContinueClipId(song.id);
    setContinueAt(song.time.toString());
    setMaxTime(song.time);
    setSongModalVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Title:</Text>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginBottom: 16 }} />
      <Text>Tags:</Text>
      <TextInput value={tags} onChangeText={setTags} style={{ borderWidth: 1, marginBottom: 16 }} />
      <Text>Prompt:</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        onSelectionChange={(event) => setPromptSelection(event.nativeEvent.selection)}
        style={{ borderWidth: 1, marginBottom: 16, height: 100, textAlignVertical: 'top' }}
        multiline
      />
      <Button title="Select Instrument" onPress={() => setInstrumentModalVisible(true)} />
      <Button title="Select Structure" onPress={() => setStructureModalVisible(true)} />
      <Button title="Select Song" onPress={() => setSongModalVisible(true)} />
      <Text>Continue Clip ID:</Text>
      <TextInput value={continueClipId} onChangeText={setContinueClipId} style={{ borderWidth: 1, marginBottom: 16 }} />
      <Text>Continue At:</Text>
      <TextInput
        value={continueAt}
        onChangeText={(text) => {
          const num = parseInt(text);
          if (!isNaN(num) && (maxTime === null || num <= maxTime)) {
            setContinueAt(text);
          }
        }}
        style={{ borderWidth: 1, marginBottom: 16 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text>Make Instrumental:</Text>
        <Switch value={makeInstrumental} onValueChange={setMakeInstrumental} />
      </View>
      <Button title="Save" onPress={saveSong} />
      <InstrumentModal
        visible={instrumentModalVisible}
        onClose={() => setInstrumentModalVisible(false)}
        onSelectInstrumentType={setSelectedType}
        onSelectInstrument={addInstrumentToPrompt}
      />
      <StructureModal
        visible={structureModalVisible}
        onClose={() => setStructureModalVisible(false)}
        onSelectStructure={addStructureToPrompt}
      />
      <SongModal
        visible={songModalVisible}
        onClose={() => setSongModalVisible(false)}
        onSelectSong={selectSong}
      />
    </View>
  );
};

export default AddEditSongScreen;
