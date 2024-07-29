import React from 'react';
import { Input } from 'react-native-elements';
import { StyleSheet } from 'react-native';

const InputField = ({ label, value, onChangeText, multiline = false }) => (
  <Input
    label={label}
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    containerStyle={styles.inputContainer}
  />
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
});

export default InputField;