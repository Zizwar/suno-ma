
import { View, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';

const SongModal = ({ visible, data, onSelect, onClose }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onSelect(item)}
    >
      <Icon
        name="music-note"
        type="material"
        size={40}
        color="#4a90e2"
      />
      <Text style={styles.itemText}>{item.text || item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Song</Text>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
          />
          <Button
            title="Close"
            onPress={onClose}
            icon={<Icon name="close" size={30} color="#fff" />}
            buttonStyle={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 10,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    width: '45%',
    aspectRatio: 1,
  },
  itemText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default SongModal;
