import React from 'react';
import { View, Text, TextInput } from 'react-native';

const InputField = ({ label, value, onChangeText, multiline = false }) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ marginBottom: 8 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={{ borderWidth: 1, padding: 8, height: multiline ? 100 : 40 }}
      />
    </View>
  );
};

export default InputField;
