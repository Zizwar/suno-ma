import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { AntDesign, Entypo, FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const DownloadScreen = () => {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (url) {
      fetchMetadata();
    }
  }, [url]);

  const fetchMetadata = async () => {
    try {
      const id = url.split('/').pop();
      const response = await fetch(`https://suno.deno.dev/metadata?ids=${id}`);
      const data = await response.json();
      setMetadata(data.metadata[0]);
      setTitle(data.metadata[0].title);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      Alert.alert('خطأ', 'فشل في جلب البيانات الوصفية. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDownload = async (type) => {
    setDownloadStatus('جاري التنزيل...');
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى مكتبة الوسائط');
        return;
      }

      const downloadUrl = `https://cdn1.suno.ai/${metadata.id}.${type}`;
      const fileName = `${title}_${Date.now()}.${type}`;
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
      Alert.alert('خطأ', 'حدث خطأ أثناء التنزيل. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        placeholder="أدخل الرابط أو المعرف"
        value={url}
        onChangeText={setUrl}
        leftIcon={<AntDesign name="link" size={24} color="black" />}
      />
      
      {metadata && (
        <View style={styles.metadataContainer}>
          <Image 
            source={{ uri: metadata.image_large_url }} 
            style={styles.image}
          />
          <Text style={styles.title}>{metadata.title}</Text>
          <Text style={styles.artist}>{metadata.display_name}</Text>
          
          <ScrollView style={styles.promptContainer}>
            <Text style={styles.prompt}>{metadata.metadata.prompt}</Text>
          </ScrollView>
          
          <ScrollView horizontal style={styles.tagsContainer}>
            {metadata.metadata.tags.split(', ').map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
          
          <Input
            placeholder="عنوان الملف"
            value={title}
            onChangeText={setTitle}
            leftIcon={<Entypo name="edit" size={24} color="black" />}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="تنزيل MP3"
              onPress={() => handleDownload('mp3')}
              icon={<FontAwesome name="music" size={15} color="white" />}
            />
            <Button
              title="تنزيل فيديو"
              onPress={() => handleDownload('mp4')}
              icon={<FontAwesome name="video-camera" size={15} color="white" />}
            />
          </View>
        </View>
      )}
      
      {downloadStatus !== '' && (
        <View style={styles.statusContainer}>
          <FontAwesome name="download" size={24} color="black" />
          <Text style={styles.statusText}>{downloadStatus}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  metadataContainer: {
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artist: {
    fontSize: 16,
    marginBottom: 10,
  },
  promptContainer: {
    maxHeight: 100,
    marginBottom: 10,
  },
  prompt: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 5,
    marginRight: 5,
  },
  tagText: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
  },
  statusText: {
    marginLeft: 10,
  },
});

export default DownloadScreen;