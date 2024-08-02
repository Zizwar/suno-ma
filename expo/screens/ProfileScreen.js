import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Input, Avatar, Text, Icon } from 'react-native-elements';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const ProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  useEffect(() => {
    handleSignInResult();
  }, [response]);

  const handleSignInResult = async () => {
    if (response?.type === 'success') {
      const { authentication } = response;
      await getUserInfo(authentication.accessToken);
    }
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await response.json();
      setUserInfo(user);
      setUsername(user.name);
      setEmail(user.email);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleSave = () => {
    console.log('Saving profile:', { username, email });
    Alert.alert('Profile Saved', 'Your profile has been updated successfully.');
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar
          rounded
          size="large"
          source={{ uri: userInfo?.picture || 'https://via.placeholder.com/150' }}
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
      <Button
        title="Sign in with Google"
        onPress={handleGoogleSignIn}
        icon={
          <Icon
            name="google"
            type="font-awesome"
            size={20}
            color="white"
            style={{ marginRight: 10 }}
          />
        }
        containerStyle={styles.googleButton}
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
  googleButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#4285F4',
  },
});

export default ProfileScreen;