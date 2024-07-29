// suno5/components/AdvancedPromptModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Button, Text, Icon, Input, Overlay } from 'react-native-elements';

// Import local data
import emotionsData from '../data/emotions.json';
import genresData from '../data/genres.json';
import periodsData from '../data/periods.json';
import productionsData from '../data/productions.json';
import regionsData from '../data/regions.json';
import vocalsData from '../data/vocals.json';
import extrasData from '../data/extras.json';
import commandsData from '../data/commands.json';

const { width } = Dimensions.get('window');

const categories = [
  { name: 'Cmd', data: commandsData, icon: 'code', color: '#FFA500' },
  { name: 'Emotions', data: emotionsData, icon: 'mood', color: '#FFD700' },
  { name: 'Genres', data: genresData, icon: 'music-note', color: '#4169E1' },
  { name: 'Periods', data: periodsData, icon: 'access-time', color: '#32CD32' },
  { name: 'Prod', data: productionsData, icon: 'equalizer', color: '#FF4500' },
  { name: 'Regions', data: regionsData, icon: 'public', color: '#8A2BE2' },
  { name: 'Vocals', data: vocalsData, icon: 'mic', color: '#FF1493' },
  { name: 'Extras', data: extrasData, icon: 'stars', color: '#20B2AA' },
];

const AdvancedPromptModal = ({ visible, onClose, prompt, onUpdatePrompt }) => {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  const handlePromptChange = useCallback((text) => {
    setLocalPrompt(text);
    onUpdatePrompt(text);
  }, [onUpdatePrompt]);

  const handleCategoryPress = useCallback((category) => {
    setSelectedCategory(category);
    setOptionsVisible(true);
  }, []);

  const handleItemSelect = useCallback((item) => {
    let newText;
    if (typeof item === 'string') {
      newText = `[${item}]\n`;
    } else if (item.value) {
      newText = `${item.value}\n`;
    }
    
    if (newText) {
      const updatedPrompt = localPrompt.slice(0, cursorPosition) + newText + localPrompt.slice(cursorPosition);
      handlePromptChange(updatedPrompt);
      setCursorPosition(cursorPosition + newText.length);
    }
    
    setOptionsVisible(false);
  }, [localPrompt, cursorPosition, handlePromptChange]);

  const renderCategoryButton = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.categoryButton}
      onPress={() => handleCategoryPress(item)}
    >
      <Icon
        name={item.icon}
        type="material"
        color={item.color}
        size={20}
        containerStyle={styles.categoryIcon}
      />
      <Text style={styles.categoryButtonText}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  const renderCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.itemButton}
      onPress={() => handleItemSelect(item)}
    >
      <Icon
        name={selectedCategory.icon}
        type="material"
        color={selectedCategory.color}
        size={20}
        containerStyle={styles.itemIcon}
      />
      <Text style={styles.itemButtonText}>
        {typeof item === 'string' ? item : item.text}
      </Text>
    </TouchableOpacity>
  ), [handleItemSelect, selectedCategory]);

  return (
    <Overlay isVisible={visible} onBackdropPress={onClose} overlayStyle={styles.overlay}>
      <Text h4 style={styles.modalTitle}>Advanced Prompt Input</Text>
      <ScrollView style={{height:"70%"}}>
        <Input
          value={localPrompt}
          onChangeText={handlePromptChange}
          multiline
          numberOfLines={7}
          textAlignVertical="top"
          containerStyle={styles.inputContainer}
          onSelectionChange={(event) => setCursorPosition(event.nativeEvent.selection.start)}
        />
      </ScrollView>
      <FlatList
        data={categories}
        renderItem={renderCategoryButton}
        keyExtractor={(item) => item.name}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />
      <Button
        title="Close"
        onPress={onClose}
        buttonStyle={styles.closeButton}
      />
      <Overlay isVisible={optionsVisible} onBackdropPress={() => setOptionsVisible(false)} overlayStyle={styles.optionsOverlay}>
        <Text h4 style={styles.optionsTitle}>{selectedCategory?.name}</Text>
        <FlatList
          data={selectedCategory?.data}
          renderItem={renderCategoryItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.optionsList}
        />
        <Button
          title="Back"
          onPress={() => setOptionsVisible(false)}
          buttonStyle={styles.backButton}
        />
      </Overlay>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    height: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  categoriesList: {
    maxHeight: 80,
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 60,
  },
  categoryIcon: {
    backgroundColor: 'transparent',
  },
  categoryButtonText: {
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2089dc',
  },
  optionsOverlay: {
    width: '80%',
    height: '70%',
    padding: 20,
    borderRadius: 10,
  },
  optionsTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsList: {
    flex: 1,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemIcon: {
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  itemButtonText: {
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#999',
  },
});

export default AdvancedPromptModal;