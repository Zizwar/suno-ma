import React, { useState, useEffect } from 'react';
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

const App = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

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
        minimumInterval: 15, // Interval in seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
    };
    configureBackgroundFetch();
  }, []);

  const handlePlayPause = async () => {
    await AudioManager.playPause();
    setIsPlaying(AudioManager.isPlaying);
  };

  const handleSongSelect = async (song) => {
    setCurrentSong(song);
    await AudioManager.loadAudio(song.audio_url, onPlaybackStatusUpdate);
    setIsPlaying(true);
    setPlayerModalVisible(true);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      AudioManager.duration = status.durationMillis;
      AudioManager.position = status.positionMillis;
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AudioContext.Provider value={{ 
          currentSong, 
          isPlaying, 
          handlePlayPause, 
          handleSongSelect,
          setPlayerModalVisible 
        }}>
          <NavigationContainer linking={linking}>
            <Stack.Navigator>
              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <PlayerModal
            visible={playerModalVisible}
            onClose={() => setPlayerModalVisible(false)}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </AudioContext.Provider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
