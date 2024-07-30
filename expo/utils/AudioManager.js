import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

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
    this.registerBackgroundTask();
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
    if (this.sound) {
      await TaskManager.defineTask('BACKGROUND_AUDIO_TASK', async () => {
        if (this.isPlaying) {
          await this.sound.playAsync();
        }
        return BackgroundFetch.Result.NewData;
      });
    }
  }
}

export default new AudioManager();
