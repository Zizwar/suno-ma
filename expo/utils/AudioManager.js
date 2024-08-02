// expo/utils/AudioManager.js
import { Audio } from 'expo-av';

class AudioManager {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.currentSong = null;
    this.position = 0;
    this.duration = 0;
  }

  async loadAudio(audioUrl, onPlaybackStatusUpdate) {
    if (this.sound) {
      await this.sound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );
    this.sound = sound;
    this.isPlaying = true;
    this.currentSong = audioUrl;
    await this.registerBackgroundTask();
  }

  async playPause() {
    if (this.sound) {
      if (this.isPlaying) {
        await this.sound.pauseAsync();
      } else {
        await this.sound.playAsync();
      }
      this.isPlaying = !this.isPlaying;
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      this.isPlaying = false;
    }
  }

  async setPosition(position) {
    if (this.sound) {
      await this.sound.setPositionAsync(position);
    }
  }

  async setVolume(volume) {
    if (this.sound) {
      await this.sound.setVolumeAsync(volume);
    }
  }

  async registerBackgroundTask() {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }
}

export default new AudioManager();