import React from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';

const GeneratedSong = ({ song }) => {
  const [sound, setSound] = React.useState(null);

  const playSound = async (audioUrl) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl }
    );
    setSound(sound);
    await sound.playAsync();
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={{ marginTop: 16, padding: 8, borderWidth: 1 }}>
      <Text>ID: {song.id}</Text>
      {song.audio_url ? (
        <Button title="Play Audio" onPress={() => playSound(song.audio_url)} />
      ) : (
        <Text>Music is still being generated. Checking again in 5 seconds...</Text>
      )}
    </View>
  );
};

export default GeneratedSong;
