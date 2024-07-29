// suno5/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Switch, Alert, TextInput, TouchableOpacity } from 'react-native';
import { ListItem, Text, Button, Icon, Overlay } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [settings, setSettings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [newName, setNewName] = useState('');
  const [newSess, setNewSess] = useState('');
  const [newCookie, setNewCookie] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('userLanguage', lang);
      i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      Alert.alert(t('languageChanged'), t('languageChangedMessage'));
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const addOrUpdateSetting = () => {
    if (currentSetting) {
      // Update existing setting
      const updatedSettings = settings.map(setting => 
        setting.id === currentSetting.id ? {...setting, name: newName, sess: newSess, cookie: newCookie} : setting
      );
      saveSettings(updatedSettings);
    } else {
      // Add new setting
      const newSetting = {
        id: Date.now().toString(),
        name: newName,
        sess: newSess,
        cookie: newCookie,
        isActive: settings.length === 0 // Make it active if it's the first setting
      };
      saveSettings([...settings, newSetting]);
    }
    setModalVisible(false);
    clearForm();
  };

  const deleteSetting = (id) => {
    const updatedSettings = settings.filter(setting => setting.id !== id);
    saveSettings(updatedSettings);
  };

  const toggleActive = (id) => {
    const updatedSettings = settings.map(setting => ({
      ...setting,
      isActive: setting.id === id
    }));
    saveSettings(updatedSettings);
  };

  const clearForm = () => {
    setNewName('');
    setNewSess('');
    setNewCookie('');
    setCurrentSetting(null);
  };

  const openModal = (setting = null) => {
    if (setting) {
      setCurrentSetting(setting);
      setNewName(setting.name);
      setNewSess(setting.sess);
      setNewCookie(setting.cookie);
    } else {
      clearForm();
    }
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <ListItem bottomDivider containerStyle={styles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={styles.text}>{t('darkMode')}</ListItem.Title>
        </ListItem.Content>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={darkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </ListItem>
      <ListItem bottomDivider containerStyle={styles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={styles.text}>{t('notifications')}</ListItem.Title>
        </ListItem.Content>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={notifications ? "#f5dd4b" : "#f4f3f4"}
        />
      </ListItem>
      <ListItem bottomDivider containerStyle={styles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={styles.text}>{t('language')}</ListItem.Title>
          <ListItem.Subtitle style={styles.subtitle}>{t('currentLanguage')}: {t(currentLanguage)}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <View style={styles.languageButtons}>
        <Button
          title={t('english')}
          onPress={() => changeLanguage('en')}
          buttonStyle={[styles.languageButton, currentLanguage === 'en' && styles.activeLanguage]}
        />
        <Button
          title={t('arabic')}
          onPress={() => changeLanguage('ar')}
          buttonStyle={[styles.languageButton, currentLanguage === 'ar' && styles.activeLanguage]}
        />
        <Button
          title={t('french')}
          onPress={() => changeLanguage('fr')}
          buttonStyle={[styles.languageButton, currentLanguage === 'fr' && styles.activeLanguage]}
        />
        <Button
          title={t('tamazight')}
          onPress={() => changeLanguage('amz')}
          buttonStyle={[styles.languageButton, currentLanguage === 'amz' && styles.activeLanguage]}
        />
      </View>

      <Text style={styles.sectionTitle}>{t('cookieManagement')}</Text>
      {settings.map((setting) => (
        <ListItem key={setting.id} bottomDivider containerStyle={styles.listItem}>
          <ListItem.Content>
            <ListItem.Title style={styles.text}>{setting.name}</ListItem.Title>
            <ListItem.Subtitle style={styles.subtitle}>{t('active')}: {setting.isActive ? t('yes') : t('no')}</ListItem.Subtitle>
          </ListItem.Content>
          <TouchableOpacity onPress={() => toggleActive(setting.id)}>
            <Icon name={setting.isActive ? 'radio-button-checked' : 'radio-button-unchecked'} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openModal(setting)}>
            <Icon name="edit" color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteSetting(setting.id)}>
            <Icon name="delete" color="#fff" />
          </TouchableOpacity>
        </ListItem>
      ))}
      <Button
        title={t('addNewSetting')}
        onPress={() => openModal()}
        buttonStyle={styles.addButton}
        icon={<Icon name="add" color="#fff" />}
      />

      <Overlay isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} overlayStyle={styles.overlay}>
        <Text style={styles.modalTitle}>{currentSetting ? t('editSetting') : t('addNewSetting')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('name')}
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Sess"
          value={newSess}
          onChangeText={setNewSess}
        />
        <TextInput
          style={styles.input}
          placeholder="Cookie"
          value={newCookie}
          onChangeText={setNewCookie}
        />
        <Button
          title={currentSetting ? t('update') : t('add')}
          onPress={addOrUpdateSetting}
          buttonStyle={styles.modalButton}
        />
        <Button
          title={t('cancel')}
          onPress={() => setModalVisible(false)}
          buttonStyle={[styles.modalButton, styles.cancelButton]}
        />
      </Overlay>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listItem: {
    backgroundColor: '#222',
  },
  text: {
    color: '#fff',
  },
  subtitle: {
    color: '#888',
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  languageButton: {
    backgroundColor: '#444',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activeLanguage: {
    backgroundColor: '#81b0ff',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    margin: 20,
  },
  overlay: {
    width: '80%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
});

export default SettingsScreen;