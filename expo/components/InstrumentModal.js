import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import instruData from '../data/instru.json';

const InstrumentModal = ({ visible, onClose, onSelectInstrument }) => {
  const [selectedType, setSelectedType] = useState('');

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleInstrumentSelect = (value) => {
    onSelectInstrument(value);
    setSelectedType('');
    onClose();
  };

  const renderItem = ({ item, isInstrument }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => isInstrument ? handleInstrumentSelect(item.value) : handleTypeSelect(item.type)}
    >
      <Text style={styles.emoji}>{item.emo}</Text>
      <Text style={styles.itemText}>{isInstrument ? item.name : item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {selectedType ? 'Select Instrument' : 'Select Instrument Type'}
          </Text>
          <FlatList
            data={selectedType ? instruData.find(item => item.type === selectedType)?.instru : instruData}
            keyExtractor={(item) => selectedType ? item.name : item.type}
            renderItem={({ item }) => renderItem({ item, isInstrument: !!selectedType })}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
          />
          {selectedType && (
            <Button
              title="Back"
              onPress={() => setSelectedType('')}
              icon={<Icon name="arrow-back" size={30} color="#fff" />}
              buttonStyle={styles.backButton}
            />
          )}
          <Button
            title="Close"
            onPress={onClose}
            icon={<Icon name="close" size={30} color="#fff" />}
            buttonStyle={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 10,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    width: '45%',
    aspectRatio: 1,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default InstrumentModal;
