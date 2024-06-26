import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import AddEditSongScreen from './screens/AddEditSongScreen';
import SongDetailScreen from './screens/SongDetailScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'My Songs' }} />
        <Stack.Screen name="AddEditSong" component={AddEditSongScreen} options={{ title: 'Add/Edit Song' }} />
        <Stack.Screen name="SongDetail" component={SongDetailScreen} options={{ title: 'Song Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
