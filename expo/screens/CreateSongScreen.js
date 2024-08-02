import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Switch, StyleSheet, Alert, FlatList, Dimensions } from 'react-native';
import { Input, Slider, Button, Card, Text, Icon, Overlay, ListItem } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InstrumentModal from '../components/InstrumentModal';
import AdvancedPromptModal from '../components/AdvancedPromptModal';
import AdvancedSongModal from '../components/AdvancedSongModal';
import { generateSong } from '../utils/fetchSongs';
import structuresData from '../data/structures.json';

const { width } = Dimensions.get('window');

const CreateSongScreen = ({ navigation, route, isModal = false, onClose }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [prompt, setPrompt] = useState('');
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [instrumentModalVisible, setInstrumentModalVisible] = useState(false);
  const [songOptionsVisible, setSongOptionsVisible] = useState(false);
  const [structureOptionsVisible, setStructureOptionsVisible] = useState(false);
  const [advancedPromptModalVisible, setAdvancedPromptModalVisible] = useState(false);
  const [continueClip, setContinueClip] = useState(null);
  const [selectedTime, setSelectedTime] = useState(0);
  const [savedItems, setSavedItems] = useState([]);
  const [savedItemsOverlayVisible, setSavedItemsOverlayVisible] = useState(false);
  const [saveNameModalVisible, setSaveNameModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');

  const promptInputRef = useRef(null);

  useEffect(() => {
    loadSavedItems();
    if (route?.params?.song) {
      const { song } = route.params;
      setTitle(song.title);
      setTag(song.metadata?.tags || '');
      setPrompt(song.metadata?.prompt || '');
      setMakeInstrumental(song.metadata?.has_vocal === false);
      setContinueClip(song.metadata?.audio_prompt_id ? { id: song.metadata.audio_prompt_id, time: song.metadata.history?.[0]?.continue_at } : null);
    }
  }, [route?.params?.song]);

  const loadSavedItems = async () => {
    try {
      const savedItemsString = await AsyncStorage.getItem('savedItems');
      if (savedItemsString) {
        setSavedItems(JSON.parse(savedItemsString));
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    }
  };

  const handleModalSelect = (item, type) => {
    if (type === 'instrument' || type === 'structure') {
      insertTextAtCursor(`${item.value}\n`);
    } else if (type === 'song') {
      setContinueClip(item);
      setSelectedTime(Math.floor(item.metadata?.duration || 0));
    }
    
    if (type === 'instrument') setInstrumentModalVisible(false);
    if (type === 'structure') setStructureOptionsVisible(false);
    if (type === 'song') setSongOptionsVisible(false);
  };

const insertTextAtCursor = (text) => {
  const selection = promptInputRef.current.props.selection;
  const beforeCursor = prompt.substring(0, selection.start);
  const afterCursor = prompt.substring(selection.end);
  const updatedPrompt = beforeCursor + text + afterCursor;
  setPrompt(updatedPrompt);
  
  // Move cursor to the end of the inserted text
  setTimeout(() => {
    promptInputRef.current.setNativeProps({
      selection: { start: selection.start + text.length, end: selection.start + text.length }
    });
  }, 0);
};

  const handleGenerate = async () => {
    Alert.alert(
      t('confirmGenerate'),
      t('areYouSureGenerate'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('yes'),
          onPress: async () => {
            const requestData = {
              title,
              tags: tag,
              prompt: makeInstrumental ? null : prompt,
              continue_clip_id: continueClip?.id,
              continue_at: selectedTime,
              make_instrumental: makeInstrumental,
              mv: 'chirp-v3-5',
            };

            try {
              const result = await generateSong(requestData);
              Alert.alert(t('success'), t('songGeneratedSuccess'));
              if (isModal && onClose) {
                onClose();
              } else {
                navigation.navigate('Library');
              }
            } catch (error) {
              console.error('Error generating song:', error);
              Alert.alert(t('error'), t('songGenerationFailed'));
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setSaveName(title);
    setSaveNameModalVisible(true);
  };

  const confirmSave = async () => {
    try {
      const newItem = { name: saveName, title, tag, prompt, makeInstrumental, continueClip, selectedTime };
      const updatedItems = [...savedItems, newItem];
      await AsyncStorage.setItem('savedItems', JSON.stringify(updatedItems));
      setSavedItems(updatedItems);
      Alert.alert(t('success'), t('itemSavedSuccess'));
      setSaveNameModalVisible(false);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert(t('error'), t('itemSaveFailed'));
    }
  };

  const handleLoadSavedItem = (savedItem) => {
    setTitle(savedItem.title);
    setTag(savedItem.tag);
    setPrompt(savedItem.prompt);
    setMakeInstrumental(savedItem.makeInstrumental);
    setContinueClip(savedItem.continueClip);
    setSelectedTime(savedItem.selectedTime);
    setSavedItemsOverlayVisible(false);
  };

  const handleDeleteSavedItem = async (index) => {
    try {
      const updatedItems = savedItems.filter((_, i) => i !== index);
      await AsyncStorage.setItem('savedItems', JSON.stringify(updatedItems));
      setSavedItems(updatedItems);
      Alert.alert(t('success'), t('itemDeletedSuccess'));
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert(t('error'), t('itemDeleteFailed'));
    }
  };

  const renderSavedItem = ({ item, index }) => (
    <ListItem bottomDivider containerStyle={styles.savedItemContainer}>
      <ListItem.Content>
        <ListItem.Title style={styles.savedItemTitle}>{item.name}</ListItem.Title>
        <ListItem.Subtitle style={styles.savedItemSubtitle}>{item.title}</ListItem.Subtitle>
      </ListItem.Content>
      <Button
        icon={<Icon name="edit" type="material" color="#2089dc" size={30} />}
        onPress={() => handleLoadSavedItem(item)}
        type="clear"
      />
      <Button
        icon={<Icon name="delete" type="material" color="#e74c3c" size={30} />}
        onPress={() => handleDeleteSavedItem(index)}
        type="clear"
      />
    </ListItem>
  );

  return (
    <ScrollView>
      <Card>
        <Card.Title h4>{isModal ? t('createNewSong') : t('createSong')}</Card.Title>
        <Card.Divider />
        <Input
          label={t('title')}
          value={title}
          onChangeText={setTitle}
          placeholder={t('enterSongTitle')}
        />
        <Input
          label={t('tag')}
          value={tag}
          onChangeText={setTag}
          placeholder={t('enterTag')}
        />
        <Input
  ref={promptInputRef}
  label={t('prompt')}
  value={prompt}
  onChangeText={setPrompt}
  placeholder={t('enterSongPrompt')}
  multiline
  numberOfLines={4}
  disabled={makeInstrumental}
/>
        {continueClip && (
          <View>
            <Text>{t('selectedSong', { title: continueClip.title })}</Text>
            <Text>{t('duration', { duration: Math.floor(continueClip.metadata?.duration || 0) })}</Text>
            <Slider
              value={selectedTime}
              onValueChange={setSelectedTime}
              minimumValue={1}
              maximumValue={Math.floor(continueClip.metadata?.duration || 0)}
              step={1}
            />
            <Text>{t('selectedTime', { time: selectedTime })}</Text>
          </View>
        )}
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>{t('makeInstrumental')}</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={makeInstrumental}
            onValueChange={setMakeInstrumental}
          />
        </ListItem>
        <View style={styles.buttonGrid}>
          <Button
            title={t('song')}
            icon={<Icon name="queue-music" color="white" />}
            onPress={() => setSongOptionsVisible(true)}
            containerStyle={styles.gridButton}
          />
          <Button
            title={t('structure')}
            icon={<Icon name="format-list-bulleted" color="white" />}
            onPress={() => setStructureOptionsVisible(true)}
            containerStyle={styles.gridButton}
          />
          <Button
            title={t('instrument')}
            icon={<Icon name="music-note" color="white" />}
            onPress={() => setInstrumentModalVisible(true)}
            containerStyle={styles.gridButton}
          />
          <Button
            title={t('advanced')}
            icon={<Icon name="edit" color="white" />}
            onPress={() => setAdvancedPromptModalVisible(true)}
            containerStyle={styles.gridButton}
          />
        </View>
        <View style={styles.actionButtons}>
          <Button
            title={t('save')}
            icon={<Icon name="save" color="white" />}
            onPress={handleSave}
            containerStyle={styles.actionButton}
          />
          <Button
            title={t('savedList')}
            icon={<Icon name="list" color="white" />}
            onPress={() => setSavedItemsOverlayVisible(true)}
            containerStyle={styles.actionButton}
          />
        </View>
        <Button
          title={t('generate')}
          icon={<Icon name="noise-aware" color="white" />}
          onPress={handleGenerate}
          containerStyle={styles.generateButton}
        />
        {isModal && (
          <Button
            title={t('close')}
            onPress={onClose}
            type="outline"
            containerStyle={{ marginTop: 10 }}
          />
        )}
      </Card>

      <InstrumentModal
        visible={instrumentModalVisible}
        onClose={() => setInstrumentModalVisible(false)}
        onSelectInstrument={(value) => handleModalSelect({ value }, 'instrument')}
      />

      <Overlay isVisible={structureOptionsVisible} onBackdropPress={() => setStructureOptionsVisible(false)}>
        <Text h4>{t('selectStructure')}</Text>
        <FlatList
          data={structuresData}
          renderItem={({ item }) => (
            <ListItem onPress={() => handleModalSelect(item, 'structure')} bottomDivider>
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button
          title={t('back')}
          onPress={() => setStructureOptionsVisible(false)}
          containerStyle={{ marginTop: 10 }}
        />
      </Overlay>

      <AdvancedSongModal
        visible={songOptionsVisible}
        onClose={() => setSongOptionsVisible(false)}
        onSelectSong={(song) => handleModalSelect(song, 'song')}
      />
      
      <AdvancedPromptModal
  visible={advancedPromptModalVisible}
  onClose={() => setAdvancedPromptModalVisible(false)}
  onUpdatePrompt={setPrompt}
  prompt={prompt}
/>

      <Overlay 
        isVisible={savedItemsOverlayVisible} 
        onBackdropPress={() => setSavedItemsOverlayVisible(false)}
        overlayStyle={styles.savedItemsOverlay}
      >
        <Text h4 style={styles.overlayTitle}>{t('savedList')}</Text>
        <FlatList
          data={savedItems}
          renderItem={renderSavedItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.savedItemsList}
        />
        <Button
          title={t('close')}
          onPress={() => setSavedItemsOverlayVisible(false)}
          containerStyle={{ marginTop: 10 }}
        />
      </Overlay>

      <Overlay isVisible={saveNameModalVisible} onBackdropPress={() => setSaveNameModalVisible(false)}>
        <Text h4>{t('saveItem')}</Text>
        <Input
          label={t('itemName')}
          value={saveName}
          onChangeText={setSaveName}
          placeholder={t('enterItemName')}
        />
        <Button
          title={t('save')}
          onPress={confirmSave}
          containerStyle={{ marginTop: 10 }}
        />
        <Button
          title={t('cancel')}
          onPress={() => setSaveNameModalVisible(false)}
          type="outline"
          containerStyle={{ marginTop: 10 }}
        />
      </Overlay>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  gridButton: {
    width: '48%',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  generateButton: {
    marginTop: 20,
  },
  overlayTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  savedItemsOverlay: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  savedItemsList: {
    flexGrow: 0,
  },
  savedItemContainer: {
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  savedItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  savedItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
export default CreateSongScreen;