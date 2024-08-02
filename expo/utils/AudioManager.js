// suno5/utils/AudioManager.js
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
    this.playlist = [];
    this.currentIndex = -1;
    this.repeatMode = 'none'; // 'none', 'one', 'all'
  }

  async loadAudio(song, onPlaybackStatusUpdate) {
    if (this.sound) {
      await this.sound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: song.audio_url },
      { shouldPlay: true },
      this.onPlaybackStatusUpdate(onPlaybackStatusUpdate)
    );
    this.sound = sound;
    this.isPlaying = true;
    this.currentSong = song;
    this.registerBackgroundTask();
  }

  onPlaybackStatusUpdate = (callback) => (status) => {
    if (status.isLoaded) {
      this.position = status.positionMillis;
      this.duration = status.durationMillis;
      callback(status);

      if (status.didJustFinish) {
        this.handleSongEnd();
      }
    }
  }

  async handleSongEnd() {
    switch (this.repeatMode) {
      case 'one':
        await this.sound.replayAsync();
        break;
      case 'all':
        await this.playNext();
        break;
      case 'none':
      default:
        if (this.currentIndex < this.playlist.length - 1) {
          await this.playNext();
        }
        break;
    }
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

  setRepeatMode(mode) {
    this.repeatMode = mode;
  }

  setPlaylist(songs) {
    this.playlist = songs;
    this.currentIndex = 0;
  }

  async playNext() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      await this.loadAudio(this.playlist[this.currentIndex]);
    } else if (this.repeatMode === 'all') {
      this.currentIndex = 0;
      await this.loadAudio(this.playlist[this.currentIndex]);
    }
  }

  async playPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.loadAudio(this.playlist[this.currentIndex]);
    } else if (this.repeatMode === 'all') {
      this.currentIndex = this.playlist.length - 1;
      await this.loadAudio(this.playlist[this.currentIndex]);
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