import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Switch, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Input, Slider,Button, Card, Text, Icon, Overlay } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InstrumentModal from '../components/InstrumentModal';
import AdvancedPromptModal from '../components/AdvancedPromptModal';
import AdvancedSongModal from '../components/AdvancedSongModal';
import { generateSong } from '../utils/fetchSongs';
import structuresData from '../data/structures.json';
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
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [savedPromptsModalVisible, setSavedPromptsModalVisible] = useState(false);

  const promptInputRef = useRef(null);

  useEffect(() => {
    loadSavedPrompts();
    if (route?.params?.song) {
      const { song } = route.params;
      setTitle(song.title);
      setTag(song.metadata?.tags || '');
      setPrompt(song.metadata?.prompt || '');
      setMakeInstrumental(song.metadata?.has_vocal === false);
      setContinueClip(song.metadata?.audio_prompt_id ? { id: song.metadata.audio_prompt_id, time: song.metadata.history?.[0]?.continue_at } : null);
    }
  }, [route?.params?.song]);

  const loadSavedPrompts = async () => {
    try {
      const savedPromptsString = await AsyncStorage.getItem('savedPrompts');
      if (savedPromptsString) {
        setSavedPrompts(JSON.parse(savedPromptsString));
      }
    } catch (error) {
      console.error('Error loading saved prompts:', error);
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
    const cursorPosition = promptInputRef.current.props.selection?.start || prompt.length;
    const updatedPrompt = prompt.slice(0, cursorPosition) + text + prompt.slice(cursorPosition);
    setPrompt(updatedPrompt);
  };

  const handleGenerate = async () => {
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
  };

  const handleSave = async () => {
    try {
      const newPrompt = { title, tag, prompt, makeInstrumental, continueClip, selectedTime };
      const updatedPrompts = [...savedPrompts, newPrompt];
      await AsyncStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
      setSavedPrompts(updatedPrompts);
      Alert.alert(t('success'), t('promptSavedSuccess'));
    } catch (error) {
      console.error('Error saving prompt:', error);
      Alert.alert(t('error'), t('promptSaveFailed'));
    }
  };

  const handleLoadSavedPrompt = (savedPrompt) => {
    setTitle(savedPrompt.title);
    setTag(savedPrompt.tag);
    setPrompt(savedPrompt.prompt);
    setMakeInstrumental(savedPrompt.makeInstrumental);
    setContinueClip(savedPrompt.continueClip);
    setSelectedTime(savedPrompt.selectedTime);
    setSavedPromptsModalVisible(false);
  };

  const handleDeleteSavedPrompt = async (index) => {
    try {
      const updatedPrompts = savedPrompts.filter((_, i) => i !== index);
      await AsyncStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
      setSavedPrompts(updatedPrompts);
      Alert.alert(t('success'), t('promptDeletedSuccess'));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      Alert.alert(t('error'), t('promptDeleteFailed'));
    }
  };

  const renderSavedPromptItem = ({ item, index }) => (
    <View style={styles.savedPromptItem}>
      <Text style={styles.savedPromptTitle}>{item.title}</Text>
      <View style={styles.savedPromptButtons}>
        <TouchableOpacity onPress={() => handleLoadSavedPrompt(item)}>
          <Icon name="edit" type="material" color="#2089dc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteSavedPrompt(index)}>
          <Icon name="delete" type="material" color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title>{isModal ? t('createNewSong') : t('createSong')}</Card.Title>
        <Input
          label={t('title')}
          value={title}
          onChangeText={setTitle}
          placeholder={t('enterSongTitle')}
          inputStyle={styles.input}
        />
        <Input
          label={t('tag')}
          value={tag}
          onChangeText={setTag}
          placeholder={t('enterTag')}
          inputStyle={styles.input}
        />
        <Input
          ref={promptInputRef}
          label={t('prompt')}
          value={prompt}
          onChangeText={setPrompt}
          placeholder={t('enterSongPrompt')}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          disabled={makeInstrumental}
          inputStyle={styles.input}
        />
        {continueClip && (
          <View style={styles.selectedSongContainer}>
            <Text style={styles.selectedSongText}>Selected song: {continueClip.title}</Text>
            <Text style={styles.selectedSongText}>Duration: {Math.floor(continueClip.metadata?.duration || 0)}s</Text>
            <Slider
              value={selectedTime}
              onValueChange={setSelectedTime}
              minimumValue={1}
              maximumValue={Math.floor(continueClip.metadata?.duration || 0)}
              step={1}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
            />
            <Text style={styles.selectedSongText}>Selected time: {selectedTime}s</Text>
          </View>
        )}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{t('makeInstrumental')}</Text>
          <Switch
            value={makeInstrumental}
            onValueChange={setMakeInstrumental}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={makeInstrumental ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={t('song')}
            icon={<Icon name="queue-music" color="#ffffff" size={24} />}
            buttonStyle={[styles.button, styles.songButton]}
            containerStyle={styles.buttonWrapper}
            onPress={() => setSongOptionsVisible(true)}
          />
          <Button
            title={t('structure')}
            icon={<Icon name="format-list-bulleted" color="#ffffff" />}
            buttonStyle={[styles.button, styles.structureButton]}
            containerStyle={styles.buttonWrapper}
            onPress={() => setStructureOptionsVisible(true)}
          />
          <Button
            title={t('instrument')}
            icon={<Icon name="music-note" color="#ffffff" />}
            buttonStyle={[styles.button, styles.instrumentButton]}
            containerStyle={styles.buttonWrapper}
            onPress={() => setInstrumentModalVisible(true)}
          />
          <Button
            title={t('advanced')}
            icon={<Icon name="edit" color="#ffffff" />}
            buttonStyle={[styles.button, styles.advancedButton]}
            containerStyle={styles.buttonWrapper}
            onPress={() => setAdvancedPromptModalVisible(true)}
          />
        </View>
        <View style={styles.actionButtonsContainer}>
          <Button
            title={t('generate')}
            onPress={handleGenerate}
            icon={<Icon name="noise-aware" color="#ffffff" />}
            buttonStyle={styles.generateButton}
          />
          <Button
            title={t('save')}
            onPress={handleSave}
            icon={<Icon name="save" color="#ffffff" />}
            buttonStyle={styles.saveButton}
          />
          <Button
            title={t('savedPrompts')}
            onPress={() => setSavedPromptsModalVisible(true)}
            icon={<Icon name="list" color="#ffffff" />}
            buttonStyle={styles.savedPromptsButton}
          />
        </View>
        {isModal && (
          <Button
            title={t('close')}
            onPress={onClose}
            buttonStyle={styles.closeButton}
          />
        )}
      </Card>

      <InstrumentModal
        visible={instrumentModalVisible}
        onClose={() => setInstrumentModalVisible(false)}
        onSelectInstrument={(value) => handleModalSelect({ value }, 'instrument')}
      />
   
     <Overlay isVisible={structureOptionsVisible} onBackdropPress={() => setStructureOptionsVisible(false)} overlayStyle={styles.optionsOverlay}>
  <Text h4 style={styles.optionsTitle}>{t('selectStructure')}</Text>
  <FlatList
    data={structuresData}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.structureItem}
        onPress={() => handleModalSelect(item, 'structure')}
      >
        <Text style={styles.structureItemText}>{item.name}</Text>
      </TouchableOpacity>
    )}
    keyExtractor={(item, index) => index.toString()}
    style={styles.optionsList}
  />
  <Button
    title={t('back')}
    onPress={() => setStructureOptionsVisible(false)}
    buttonStyle={styles.backButton}
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
        onUpdatePrompt={insertTextAtCursor}
        prompt={prompt}
      />

      <Overlay isVisible={savedPromptsModalVisible} onBackdropPress={() => setSavedPromptsModalVisible(false)} overlayStyle={styles.optionsOverlay}>
        <Text h4 style={styles.optionsTitle}>{t('savedPrompts')}</Text>
        <FlatList
          data={savedPrompts}
          renderItem={renderSavedPromptItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.optionsList}
        />
        <Button
          title={t('back')}
          onPress={() => setSavedPromptsModalVisible(false)}
          buttonStyle={styles.backButton}
        />
      </Overlay>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... (الأنماط الموجودة)
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  generateButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#8e44ad',
    borderRadius: 25,
    paddingVertical: 12,
  },
  saveButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#27ae60',
    borderRadius: 25,
    paddingVertical: 12,
  },
  savedPromptsButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#3498db',
    borderRadius: 25,
    paddingVertical: 12,
  },
  savedPromptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  savedPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedPromptButtons: {
    flexDirection: 'row',
  },
});

export default CreateSongScreen;