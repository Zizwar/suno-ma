// utils/AudioManager.js
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
}

export default new AudioManager();