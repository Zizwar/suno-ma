import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Button, Modal } from 'react-native';
import structureData from '../data/structures.json';

const StructureModal = ({ visible, onClose, onSelectStructure }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text>Select Structure:</Text>
          <FlatList
            data={structureData}
            keyExtractor={(item) => item.text}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSelectStructure(item.value)}>
                <Text style={{ padding: 10 }}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default StructureModal;
