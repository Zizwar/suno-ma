import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Button, Alert, View, Text, Switch } from 'react-native';
import InputField from './components/InputField';
import SongOption from './components/SongOption';
import GeneratedSong from './components/GeneratedSong';
import { generateSong, getSongMetadata } from './utils/fetchSongs';

const songOptions = [
  { name: "amantag", style: "tamazight", id: "ab807343-3214-44f1-a192-bce0f5987e06", time: 23 },
  { name: "cha3bi", style: "chaabi Morocco", id: "ab807343-3214-44f1-a192-bce0f5987e06", time: 96 },
  // Add more options as needed
];

const App = () => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [prompt, setPrompt] = useState('');
  const [continueClip, setContinueClip] = useState(null);
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [output, setOutput] = useState(null);
  const [generatedSongs, setGeneratedSongs] = useState([]);
  const [songMetadata, setSongMetadata] = useState(null);
  const [checkingAudio, setCheckingAudio] = useState(false);
  const intervalRef = useRef(null);

  const handleSubmit = async () => {
    const requestData = {
      title,
      tags: tag,
      prompt,
      mv: "chirp-v3-5",
      continue_clip_id: continueClip?.id,
      continue_at: continueClip?.time,
      make_instrumental: makeInstrumental,
    };
    setOutput(requestData);

    const result = await generateSong(requestData);
    if (result.songs && result.songs.length > 0) {
      setGeneratedSongs(result.songs);
    } else {
      Alert.alert('Error', 'No songs generated.');
    }
  };

  const handleGetSong = async () => {
    if (generatedSongs.length === 0) {
      Alert.alert('Error', 'No generated songs to fetch.');
      return;
    }
    
    const ids = generatedSongs.join(',');
    const result = await getSongMetadata(ids);
    if (result.metadata) {
      setSongMetadata(result.metadata);
      setCheckingAudio(true);
    } else {
      Alert.alert('Error', 'No metadata found for the provided IDs.');
    }
  };

  const checkAudioStatus = async (ids) => {
    const result = await getSongMetadata(ids);
    if (result.metadata) {
      setSongMetadata(result.metadata);
      const allReady = result.metadata.every(song => song.audio_url);
      if (allReady) {
        clearInterval(intervalRef.current);
        setCheckingAudio(false);
      }
    } else {
      Alert.alert('Error', 'No metadata found for the provided IDs.');
    }
  };

  useEffect(() => {
    if (checkingAudio && generatedSongs.length > 0) {
      const ids = generatedSongs.join(',');
      intervalRef.current = setInterval(() => checkAudioStatus(ids), 5000);
      return () => clearInterval(intervalRef.current);
    }
  }, [checkingAudio, generatedSongs]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <InputField label="Title" value={title} onChangeText={setTitle} />
      <InputField label="Tag" value={tag} onChangeText={setTag} />
      <InputField label="Prompt" value={prompt} onChangeText={setPrompt} multiline />
      <Text style={{ marginBottom: 8 }}>Select Song</Text>
      {songOptions.map((option, index) => (
        <SongOption
          key={index}
          option={option}
          isSelected={continueClip === option}
          onSelect={() => setContinueClip(option)}
        />
      ))}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text>Make Instrumental</Text>
        <Switch
          value={makeInstrumental}
          onValueChange={setMakeInstrumental}
        />
      </View>
      <Button title="Submit" onPress={handleSubmit} />
      
      {output && (
        <View style={{ marginTop: 16, padding: 8, borderWidth: 1 }}>
          <Text>{JSON.stringify(output, null, 2)}</Text>
        </View>
      )}

      {generatedSongs.length > 0 && (
        <View>
          <Button title="Get Song" onPress={handleGetSong} style={{ marginTop: 16 }} />
          {songMetadata && songMetadata.map((song, index) => (
            <GeneratedSong key={index} song={song} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default App;
