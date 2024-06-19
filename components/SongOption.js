import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const SongOption = ({ option, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        marginBottom: 8,
        padding: 8,
        backgroundColor: isSelected ? '#ddd' : '#fff',
        borderWidth: 1,
      }}
    >
      <Text>{option.name} - {option.style}</Text>
    </TouchableOpacity>
  );
};

export default SongOption;
