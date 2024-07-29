// suno5/screens/DownloadScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const DownloadScreen = () => {
  const [url, setUrl] = useState('');
  const [id, setId] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleDownload = async (type) => {
    setDownloadStatus('جاري التنزيل...');
    try {
      let downloadUrl;
      let fileName;
      if (url.includes('suno.com')) {
        const uuid = url.split('/').pop();
        downloadUrl = `https://cdn1.suno.ai/${uuid}.${type}`;
        fileName = `${uuid}_${Date.now()}.${type}`;
      } else {
        downloadUrl = `https://cdn1.suno.ai/${id}.${type}`;
        fileName = `${id}_${Date.now()}.${type}`;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى مكتبة الوسائط');
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('sunoma');
      if (album === null) {
        await MediaLibrary.createAlbumAsync('sunoma', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      await FileSystem.deleteAsync(uri);

      setDownloadStatus(`تم التنزيل بنجاح: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('فشل التنزيل');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="أدخل الرابط"
        value={url}
        onChangeText={setUrl}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="أدخل المعرف"
        value={id}
        onChangeText={setId}
        placeholderTextColor="#888"
      />
      <View style={styles.buttonContainer}>
        <Button title="تنزيل MP3" onPress={() => handleDownload('mp3')} />
        <Button title="تنزيل فيديو" onPress={() => handleDownload('mp4')} />
      </View>
      <Text style={styles.status}>{downloadStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 10,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  status: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default DownloadScreen;