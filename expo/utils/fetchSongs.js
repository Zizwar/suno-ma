import AsyncStorage from '@react-native-async-storage/async-storage';

const getActiveSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem('settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      return parsedSettings.find(setting => setting.isActive);
    }
  } catch (error) {
    console.error('Error getting active settings:', error);
  }
  return null;
};

export const fetchSongs = async () => {
  try {
    const activeSettings = await getActiveSettings();
    let url = 'https://suno.deno.dev/all-songs';
    if (activeSettings) {
      url += `?sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.songs.map(song => ({
      id: song.id,
      title: song.title ||  song.metadata.prompt ||'Untitled',
      artist: song.display_name,
      subtitle: song.metadata.tags,
      image_url: song.image_url,
      audio_url: song.audio_url,
      video_url: song.video_url,
      metadata: song.metadata,
    }));
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

export const generateSong = async (requestData) => {
  try {
    const activeSettings = await getActiveSettings();
    let url = 'https://suno.deno.dev/generate';
    if (activeSettings) {
      url += `?sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getSongMetadata = async (ids) => {
  try {
    const activeSettings = await getActiveSettings();
    let url = `https://suno.deno.dev/metadata?ids=${ids}`;
    if (activeSettings) {
      url += `&sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`;
    }
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const searchSongs = async (query, style) => {
  try {
    const activeSettings = await getActiveSettings();
    let url = `https://suno.deno.dev/search?query=${encodeURIComponent(query)}&style=${encodeURIComponent(style)}`;
    if (activeSettings) {
      url += `&sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`;
    }
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
};

export const generateLyrics = async (prompt) => {
  try {
    const activeSettings = await getActiveSettings();
    let url = `https://suno.deno.dev/generate-lyrics`;
    if (activeSettings) {
      url += `?sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating lyrics:', error);
    throw error;
  }
};

export const fetchPlaylist = async (playlistId, page = 1) => {
  try {
    const activeSettings = await getActiveSettings();
    let url = `https://suno.deno.dev/playlist?id=${playlistId}&page=${page}`;
    if (activeSettings) {
      url += `&sess=${activeSettings.sess}&cookie=${activeSettings.cookie}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      user_display_name: data.user_display_name,
      playlist_clips: data.playlist_clips
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw error;
  }
};