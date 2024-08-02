// suno5/App.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from 'react-native-elements';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import MainTabs from './navigation/MainTabs';
import SettingsScreen from './screens/SettingsScreen';
import { linking } from './navigation/linking';
import AudioManager from './utils/AudioManager';
import PlayerModal from './components/PlayerModal';

import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';

export const AudioContext = React.createContext();

const Stack = createStackNavigator();

const BACKGROUND_AUDIO_TASK = 'BACKGROUND_AUDIO_TASK';

TaskManager.defineTask(BACKGROUND_AUDIO_TASK, async () => {
  try {
    if (AudioManager.isPlaying) {
      await AudioManager.playPause();
    }
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

const MainStackScreen = () => {

  return (
    <View style={{ flex: 1 }}>
      
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </View>
  );
};

const App = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (AudioManager.sound) {
        AudioManager.sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const configureBackgroundFetch = async () => {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_AUDIO_TASK, {
        minimumInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    };
    configureBackgroundFetch();

    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
    });
  }, []);

  const handlePlayPause = async () => {
    await AudioManager.playPause();
    setIsPlaying(AudioManager.isPlaying);
  };

  const handleNext = async () => {
    await AudioManager.playNext();
    setCurrentSong(AudioManager.currentSong);
    setIsPlaying(AudioManager.isPlaying);
  };

  const handlePrevious = async () => {
    await AudioManager.playPrevious();
    setCurrentSong(AudioManager.currentSong);
    setIsPlaying(AudioManager.isPlaying);
  };

  const handleSongSelect = async (song) => {
    setCurrentSong(song);
    await AudioManager.loadAudio(song, onPlaybackStatusUpdate);
    setIsPlaying(true);
    setMiniPlayerVisible(true);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AudioContext.Provider value={{ 
          currentSong, 
          isPlaying, 
          handlePlayPause, 
          handleNext,
          handlePrevious,
          handleSongSelect,
          setPlayerModalVisible,
          miniPlayerVisible,
          setMiniPlayerVisible
        }}>
          <NavigationContainer linking={linking}>
            <MainStackScreen />
          </NavigationContainer>
          <PlayerModal
            visible={playerModalVisible}
            onClose={() => setPlayerModalVisible(false)}
          />
        </AudioContext.Provider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;