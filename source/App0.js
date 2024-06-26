import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Alert, Switch, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { WebView } from 'react-native-webview';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  Button, 
  Input, 
  Text, 
  Card, 
  Icon, 
  ListItem,
  ThemeProvider
} from 'react-native-elements';

import songOptions from "./data/songs.json";
import instrumentOptions from "./data/instruments.json";
import structureOptions from "./data/structures.json";

// Utility functions
const generateSong = async (data) => {
  try {
    const response = await fetch('https://suno.deno.dev/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating song:', error);
  }
};

const getSongMetadata = async (ids) => {
  try {
    const response = await fetch(`https://suno.deno.dev/metadata?ids=${ids}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching song metadata:', error);
  }
};

// Components
const InputField = ({ label, value, onChangeText, multiline = false }) => (
  <Input
    label={label}
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    containerStyle={{ marginBottom: 15 }}
  />
);

const SongModal = ({ visible, data, type, onSelect, onClose }) => (
  <Modal
    visible={visible}
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <Card containerStyle={{ width: '80%', maxHeight: '80%' }}>
        <Card.Title>Select {type}</Card.Title>
        <ScrollView>
          {data.map((item, index) => (
            <ListItem key={index} onPress={() => onSelect(item)} bottomDivider>
              <ListItem.Content>
                <ListItem.Title>{item.text || item.name}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </ScrollView>
        <Button title="Close" onPress={onClose} />
      </Card>
    </View>
  </Modal>
);

const GeneratedSong = ({ song, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const sound = useRef(new Audio.Sound());

  const playSound = async (audioUrl) => {
    try {
      if (isPlaying) {
        await sound.current.pauseAsync();
      } else {
        await sound.current.loadAsync({ uri: audioUrl });
        await sound.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const downloadAudio = async ({audio_url, title="sunoma-"+Date.now()}) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'We need permission to access device media');
        return;
      }

      const fileUri = FileSystem.cacheDirectory + `${title}.mp3`;
      const downloadResult = await FileSystem.downloadAsync(audio_url, fileUri);

      if (downloadResult.status !== 200) {
        Alert.alert('Error', 'Failed to download audio file');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync('My Music');
      if (album === null) {
        await MediaLibrary.createAlbumAsync('My Music', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      await FileSystem.deleteAsync(fileUri);

      Alert.alert('Download Complete', 'File saved in "My Music" album');
    } catch (error) {
      console.log('Error downloading audio file:', error);
      Alert.alert('Error', 'Failed to download audio file');
    }
  };

  const openWebView = (url) => {
    setModalUrl(url);
    setModalVisible(true);
  };

  return (
    <Card>
      <Card.Title>{song.metadata.prompt}</Card.Title>
      {song.image_url && <Card.Image source={{ uri: song.image_url }} />}
      {song.audio_url && (
        <Button 
          icon={<Icon name={isPlaying ? "pause" : "play-arrow"} color="#ffffff" />}
          title={isPlaying ? "Pause Audio" : "Play Audio"} 
          onPress={() => playSound(song.audio_url)} 
        />
      )}
      {song.video_url && (
        <Button 
          icon={<Icon name="videocam" color="#ffffff" />}
          title="Watch Video" 
          onPress={() => openWebView(song.video_url)} 
        />
      )}
      {song.audio_url && (
        <Button 
          icon={<Icon name="file-download" color="#ffffff" />}
          title="Download Audio" 
          onPress={() => downloadAudio(song)} 
        />
      )}
      <Button 
        icon={<Icon name="delete" color="#ffffff" />}
        title="Delete" 
        onPress={() => onDelete(song.id)} 
        buttonStyle={{ backgroundColor: 'red' }}
      />

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <WebView source={{ uri: modalUrl }} />
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </Modal>
    </Card>
  );
};

// Screens
const HomeScreen = ({ navigation }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text h2>Welcome to AI Music Generator</Text>
    <Button 
      title="Create New Song" 
      onPress={() => navigation.navigate('CreateSong')}
      icon={<Icon name="add" color="#ffffff" />}
    />
  </View>
);

const CreateSongScreen = () => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [prompt, setPrompt] = useState('');
  const [continueClip, setContinueClip] = useState(null);
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [output, setOutput] = useState(null);
  const [generatedSongs, setGeneratedSongs] = useState([]);
  const [songMetadata, setSongMetadata] = useState([]);
  const [checkingAudio, setCheckingAudio] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState('');
  
  const intervalRef = useRef(null);

  useEffect(() => {
    loadGeneratedSongs();
  }, []);

  const loadGeneratedSongs = async () => {
    try {
      const storedSongs = await AsyncStorage.getItem('generatedSongs');
      if (storedSongs) {
        setGeneratedSongs(JSON.parse(storedSongs));
      }
    } catch (error) {
      console.error('Error loading generated songs from storage:', error);
    }
  };

  const saveGeneratedSongs = async (songs) => {
    try {
      await AsyncStorage.setItem('generatedSongs', JSON.stringify(songs));
    } catch (error) {
      console.error('Error saving generated songs to storage:', error);
    }
  };

  const handleModalSelect = (item) => {
    if (modalType === 'instrument') {
      setPrompt(prevPrompt => `${prevPrompt} ${item.value}`);
    } else if (modalType === 'structure') {
      setPrompt(prevPrompt => `${prevPrompt} ${item.value}`);
    } else if (modalType === 'song') {
      setContinueClip(item);
    }
    setModalVisible(false);
  };

  const handleOpenModal = (type, data) => {
    setModalData(data);
    setModalType(type);
    setModalVisible(true);
  };

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
      const updatedSongs = [...generatedSongs, ...result.songs];
      setGeneratedSongs(updatedSongs);
      saveGeneratedSongs(updatedSongs);
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

  const handleDeleteSong = async (id) => {
    const updatedSongs = songMetadata.filter(song => song.id !== id);
    setSongMetadata(updatedSongs);
    setGeneratedSongs(updatedSongs.map(song => song.id));
    await saveGeneratedSongs(updatedSongs.map(song => song.id));
  };

  return (
    <ScrollView>
      <Card>
        <Card.Title>Create New Song</Card.Title>
        <InputField label="Title" value={title} onChangeText={setTitle} />
        <InputField label="Tag" value={tag} onChangeText={setTag} />
        <InputField label="Prompt" value={prompt} onChangeText={setPrompt} multiline />
        <Button 
          title="Select Song" 
          onPress={() => handleOpenModal('song', songOptions)}
          icon={<Icon name="queue-music" color="#ffffff" />}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
          <Text>Make Instrumental</Text>
          <Switch
            value={makeInstrumental}
            onValueChange={setMakeInstrumental}
          />
        </View>
        <Button 
          title="Add Instrument" 
          onPress={() => handleOpenModal('instrument', instrumentOptions)}
          icon={<Icon name="music-note" color="#ffffff" />}
        />
        <Button 
          title="Add Structure" 
          onPress={() => handleOpenModal('structure', structureOptions)}
          icon={<Icon name="format-list-bulleted" color="#ffffff" />}
        />
        <Button 
          title="Submit" 
          onPress={handleSubmit}
          icon={<Icon name="send" color="#ffffff" />}
        />
      </Card>
      
      {output && (
        <Card>
          <Card.Title>Output</Card.Title>
          <Text>{JSON.stringify(output, null, 2)}</Text>
        </Card>
      )}

      {generatedSongs.length > 0 && (
        <Card>
          <Card.Title>Generated Songs</Card.Title>
          <Button 
            title="Get Song" 
            onPress={handleGetSong} 
            icon={<Icon name="get-app" color="#ffffff" />}
          />
          {songMetadata && songMetadata.map((song, index) => (
            <GeneratedSong key={index} song={song} onDelete={handleDeleteSong} />
          ))}
        </Card>
      )}

      <SongModal
        visible={modalVisible}
        data={modalData}
        type={modalType}
        onSelect={handleModalSelect}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
};

const LibraryScreen = () => {
  const [storedSongs, setStoredSongs] = useState([]);

  const loadStoredSongs = useCallback(async () => {
    try {
      const songIds = await AsyncStorage.getItem('generatedSongs');
      if (songIds) {
        const ids = JSON.parse(songIds).join(',');
        const result = await getSongMetadata(ids);
        if (result.metadata) {
          setStoredSongs(result.metadata);
        }
      }
    } catch (error) {
      console.error('Error loading stored songs:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStoredSongs();
    }, [loadStoredSongs])
  );

  const handleDeleteSong = async (id) => {
    const updatedSongs = storedSongs.filter(song => song.id !== id);
    setStoredSongs(updatedSongs);
    await AsyncStorage.setItem('generatedSongs', JSON.stringify(updatedSongs.map(song => song.id)));
  };

  return (
    <ScrollView>
      <Card>
        <Card.Title>Your Library</Card.Title>
        {storedSongs.map((song, index) => (
          <GeneratedSong key={index} song={song} onDelete={handleDeleteSong} />
        ))}
      </Card>
    </ScrollView>
  );
};
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text h3>Profile</Text>
    {/* Here you can add user profile information */}
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Library') {
          iconName = 'library-music';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Library" component={LibraryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreateSong" 
            component={CreateSongScreen} 
            options={{ title: 'Create New Song' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;