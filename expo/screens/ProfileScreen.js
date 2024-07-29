import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Avatar, Text } from 'react-native-elements';

const ProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving profile:', { username, email });
    // You might want to update AsyncStorage or send to an API here
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar
          rounded
          size="large"
          source={{ uri: 'https://via.placeholder.com/150' }}
        />
      </View>
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        containerStyle={styles.input}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        containerStyle={styles.input}
      />
      <Button
        title="Save Profile"
        onPress={handleSave}
        containerStyle={styles.button}
      />
      <Button
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
        containerStyle={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
});

export default ProfileScreen;