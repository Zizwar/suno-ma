// suno5/navigation/MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import HomeScreen from '../screens/HomeScreen';
import CreateSongScreen from '../screens/CreateSongScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DownloadScreen from '../screens/DownloadScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Create') {
          iconName = 'add-circle-outline';
        } else if (route.name === 'Library') {
          iconName = 'library-music';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        } else if (route.name === 'Download') {
          iconName = 'download';
        } else if (route.name === 'Search') {
          iconName = 'search';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Create" component={CreateSongScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Download" component={DownloadScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
  </Tab.Navigator>
);

export default MainTabs;