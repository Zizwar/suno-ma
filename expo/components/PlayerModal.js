import React, { useContext, useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Image, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { Text, Slider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { AudioContext } from '../App';
import AudioManager from '../utils/AudioManager';

const { width, height } = Dimensions.get('window');

const PlayerModal = ({ visible, onClose }) => {
  const { currentSong, isPlaying, handlePlayPause, handleNext, handlePrevious } = useContext(AudioContext);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(AudioManager.position);
      setDuration(AudioManager.duration);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 50) {
        onClose();
      }
    },
  });

  const handleSliderChange = async (value) => {
    await AudioManager.setPosition(value);
  };

  const handleVolumeChange = async (value) => {
    setVolume(value);
    await AudioManager.setVolume(value);
  };

  const handleRepeatModeChange = () => {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
    AudioManager.setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return 'repeat-one';
      case 'all':
        return 'repeat';
      default:
        return 'repeat-off';
    }
  };

  if (!currentSong) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container} {...panResponder.panHandlers}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: currentSong.image_url }} style={styles.image} />
        <Text style={styles.title}>{currentSong.title.substr(0,64)}</Text>
        <Text style={styles.artist}>{currentSong.artist}</Text>
        <Slider
          value={position}
          maximumValue={duration}
          onValueChange={handleSliderChange}
          thumbStyle={{ height: 20, width: 20 }}
          thumbTintColor="#fff"
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#777"
          style={styles.slider}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePrevious}>
            <Ionicons name="play-skip-back" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Ionicons name="play-skip-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={handleRepeatModeChange}>
            <Ionicons name={getRepeatIcon()} size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={24} color="#fff" />
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              thumbStyle={{ height: 15, width: 15 }}
              thumbTintColor="#fff"
              minimumTrackTintColor="#1DB954"
              maximumTrackTintColor="#777"
              style={styles.volumeSlider}
            />
            <Ionicons name="volume-high" size={24} color="#fff" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#b3b3b3',
    marginBottom: 20,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  timeText: {
    color: '#b3b3b3',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  playPauseButton: {
    marginHorizontal: 30,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default PlayerModal;