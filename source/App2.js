import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Alert, Switch, Modal, TouchableOpacity, StyleSheet } from 'react-native';
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
  ThemeProvider,
  Image,
  Avatar 
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
    <View style={styles.modalContainer}>
      <Card containerStyle={styles.modalCard}>
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

const SongListItem = ({ song, onPlay, onDelete, onViewDetails }) => {
  return (
    <Card containerStyle={styles.songCard}>
      <View style={styles.songCardContent}>
        <Image
          source={{ uri: song.image_url || 'https://via.placeholder.com/100' }}
          style={styles.songImage}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{song.metadata.title || 'Untitled'}</Text>
          <Text style={styles.songPrompt} numberOfLines={1}>{song.metadata.prompt}</Text>
        </View>
      </View>
      <View style={styles.songActions}>
        <TouchableOpacity onPress={() => onPlay(song.audio_url)}>
          <Icon name="play-arrow" type="material" color="#2089dc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onViewDetails}>
          <Icon name="info" type="material" color="#2089dc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(song.id)}>
          <Icon name="delete" type="material" color="#ff0000" />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const SongDetailsModal = ({ visible, song, onClose, onPlay, onDelete }) => (
  <Modal
    visible={visible}
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <Card containerStyle={styles.detailsCard}>
        <Card.Title>{song.metadata.title || 'Untitled'}</Card.Title>
        <Card.Image source={{ uri: song.image_url || 'https://via.placeholder.com/300' }} />
        <Text style={styles.promptText}>{song.metadata.prompt}</Text>
        <View style={styles.detailsActions}>
          <Button 
            icon={<Icon name="play-arrow" color="#ffffff" />}
            title="Play" 
            onPress={() => onPlay(song.audio_url)} 
          />
          <Button 
            icon={<Icon name="delete" color="#ffffff" />}
            title="Delete" 
            onPress={() => onDelete(song.id)} 
            buttonStyle={{ backgroundColor: 'red' }}
          />
        </View>
        <Button title="Close" onPress={onClose} />
      </Card>
    </View>
  </Modal>
);

// 
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
        <View style={styles.switchContainer}>
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
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const sound = useRef(new Audio.Sound());

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
    if (detailsModalVisible) {
      setDetailsModalVisible(false);
    }
  };

  const playSound = async (audioUrl) => {
    try {
      await sound.current.unloadAsync();
      await sound.current.loadAsync({ uri: audioUrl });
      await sound.current.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleViewDetails = (song) => {
    setSelectedSong(song);
    setDetailsModalVisible(true);
  };

  return (
    <ScrollView>
      <Card>
        <Card.Title>Your Library</Card.Title>
        {storedSongs.map((song, index) => (
          <SongListItem 
            key={index} 
            song={song} 
            onPlay={playSound}
            onDelete={handleDeleteSong}
            onViewDetails={() => handleViewDetails(song)}
          />
        ))}
      </Card>
      {selectedSong && (
        <SongDetailsModal
          visible={detailsModalVisible}
          song={selectedSong}
          onClose={() => setDetailsModalVisible(false)}
          onPlay={playSound}
          onDelete={handleDeleteSong}
        />
      )}
    </ScrollView>
  );
};

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


// HomeScreen
const HomeScreen = ({ navigation }) => (
  <View style={styles.homeContainer}>
    <Text h2 style={styles.homeTitle}>Welcome to AI Music Generator</Text>
    <Button 
      title="Create New Song" 
      onPress={() => navigation.navigate('CreateSong')}
      icon={<Icon name="add" color="#ffffff" />}
      containerStyle={styles.homeButton}
    />
    <Button 
      title="View Recent Songs" 
      onPress={() => navigation.navigate('Library')}
      icon={<Icon name="queue-music" color="#ffffff" />}
      containerStyle={styles.homeButton}
    />
  </View>
);

// ProfileScreen
const ProfileScreen = () => {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');

  return (
    <ScrollView contentContainerStyle={styles.profileContainer}>
      <Avatar
        rounded
        size="large"
        source={{ uri: 'https://via.placeholder.com/150' }}
        containerStyle={styles.profileAvatar}
      />
      <Text h3>{username}</Text>
      <Text>{email}</Text>
      <Button 
        title="Edit Profile" 
        icon={<Icon name="edit" color="#ffffff" />}
        containerStyle={styles.profileButton}
      />
      <Button 
        title="Settings" 
        icon={<Icon name="settings" color="#ffffff" />}
        containerStyle={styles.profileButton}
      />
      <Button 
        title="Log Out" 
        icon={<Icon name="exit-to-app" color="#ffffff" />}
        containerStyle={styles.profileButton}
        buttonStyle={{ backgroundColor: 'red' }}
      />
    </ScrollView>
  );
};

// SettingsScreen
const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollView>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Title>Dark Mode</ListItem.Title>
        </ListItem.Content>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Title>Notifications</ListItem.Title>
        </ListItem.Content>
        <Switch value={notifications} onValueChange={setNotifications} />
      </ListItem>
      <ListItem bottomDivider onPress={() => console.log('About pressed')}>
        <ListItem.Content>
          <ListItem.Title>About</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
      <ListItem bottomDivider onPress={() => console.log('Privacy Policy pressed')}>
        <ListItem.Content>
          <ListItem.Title>Privacy Policy</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </ScrollView>
  );
};

// EditProfileScreen
const EditProfileScreen = () => {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');

  return (
    <ScrollView contentContainerStyle={styles.editProfileContainer}>
      <Avatar
        rounded
        size="large"
        source={{ uri: 'https://via.placeholder.com/150' }}
        containerStyle={styles.profileAvatar}
      >
        <Avatar.Accessory size={23} />
      </Avatar>
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        leftIcon={<Icon name="person" type="material" />}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        leftIcon={<Icon name="email" type="material" />}
      />
      <Button 
        title="Save Changes" 
        icon={<Icon name="save" color="#ffffff" />}
        containerStyle={styles.editProfileButton}
      />
    </ScrollView>
  );
};

// Update MainTabs to include Settings
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
        } else if (route.name === 'Settings') {
          iconName = 'settings';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Library" component={LibraryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// Update App to include new screens
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
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ title: 'Edit Profile' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};




const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '80%',
    maxHeight: '80%',
  },
  songCard: {
    marginBottom: 10,
    padding: 10,
  },
  songCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  songInfo: {
    marginLeft: 10,
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songPrompt: {
    fontSize: 12,
    color: 'gray',
  },
  songActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  detailsCard: {
    width: '90%',
    maxHeight: '90%',
  },
  promptText: {
    marginVertical: 10,
  },
  detailsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  homeTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  homeButton: {
    width: '80%',
    marginVertical: 10,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    marginBottom: 20,
  },
  profileButton: {
    width: '80%',
    marginVertical: 10,
  },
  editProfileContainer: {
    flex: 1,
    padding: 20,
  },
  editProfileButton: {
    marginTop: 20,
  }
});

export default App;