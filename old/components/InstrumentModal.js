import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Button, Modal } from 'react-native';
import instruData from '../data/instru.json';

const InstrumentModal = ({ visible, onClose, onSelectInstrumentType, onSelectInstrument }) => {
  const [selectedType, setSelectedType] = React.useState('');

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    onSelectInstrumentType(type);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          {!selectedType ? (
            <>
              <Text>Select Instrument Type:</Text>
              <FlatList
                data={instruData}
                keyExtractor={(item) => item.type}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleTypeSelect(item.type)}>
                    <Text style={{ padding: 10 }}>{item.emo} {item.type}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <>
              <Text>Select Instrument:</Text>
              <FlatList
                data={instruData.find((item) => item.type === selectedType)?.instru}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => onSelectInstrument(item.value)}>
                    <Text style={{ padding: 10 }}>{item.emo} {item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Back" onPress={() => setSelectedType('')} />
            </>
          )}
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default InstrumentModal;
