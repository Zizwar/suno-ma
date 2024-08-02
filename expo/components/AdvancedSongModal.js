import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Icon, Input, Overlay, ListItem } from 'react-native-elements';

// Import local data
import emotionsData from '../data/emotions.json';
import genresData from '../data/genres.json';
import periodsData from '../data/periods.json';
import productionsData from '../data/productions.json';
import regionsData from '../data/regions.json';
import vocalsData from '../data/vocals.json';
import extrasData from '../data/extras.json';
import commandsData from '../data/commands.json';

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
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  const handlePromptChange = (text) => {
    setLocalPrompt(text);
    onUpdatePrompt(text);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setOptionsVisible(true);
  };

  const handleItemSelect = (item) => {
    let newText;
    if (typeof item === 'string') {
      newText = `[${item}]\n`;
    } else if (item.value) {
      newText = `${item.value}\n`;
    }
    
    if (newText) {
      const selection = inputRef.current.props.selection;
      const beforeCursor = localPrompt.substring(0, selection.start);
      const afterCursor = localPrompt.substring(selection.end);
      const updatedPrompt = beforeCursor + newText + afterCursor;
      handlePromptChange(updatedPrompt);
      
      // Move cursor to the end of the inserted text
      setTimeout(() => {
        inputRef.current.setNativeProps({
          selection: { start: selection.start + newText.length, end: selection.start + newText.length }
        });
      }, 0);
    }
    
    setOptionsVisible(false);
  };

  const renderCategoryButton = ({ item }) => (
    <ListItem
      containerStyle={styles.categoryButton}
      onPress={() => handleCategoryPress(item)}
    >
      <Icon name={item.icon} type="material" color={item.color} size={24} />
      <ListItem.Content>
        <ListItem.Title style={styles.categoryButtonText}>{item.name}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );

  const renderCategoryItem = ({ item }) => (
    <ListItem onPress={() => handleItemSelect(item)} bottomDivider>
      <Icon name={selectedCategory.icon} type="material" color={selectedCategory.color} size={24} />
      <ListItem.Content>
        <ListItem.Title>{typeof item === 'string' ? item : item.text}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <Overlay isVisible={visible} onBackdropPress={onClose} overlayStyle={styles.overlay}>
      <Text h4 style={styles.modalTitle}>Advanced Prompt Input</Text>
      <ScrollView style={styles.promptContainer}>
        <Input
          ref={inputRef}
          value={localPrompt}
          onChangeText={handlePromptChange}
          multiline
          numberOfLines={7}
          textAlignVertical="top"
          inputContainerStyle={styles.inputContainer}
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
  promptContainer: {
    flex: 1,
    marginBottom: 10,
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  categoriesList: {
    maxHeight: 80,
    marginBottom: 20,
  },
  categoryButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  categoryButtonText: {
    fontSize: 12,
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
  backButton: {
    marginTop: 20,
    backgroundColor: '#999',
  },
});

export default AdvancedPromptModal;