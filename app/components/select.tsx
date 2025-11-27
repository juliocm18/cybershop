import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, Platform, Modal, TouchableOpacity, FlatList, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface SelectProps {
  label: string;
  selectedValue: string | number | null;
  onValueChange: (itemValue: string | number) => void;
  items: { id?: string | number; name: string }[];
}

const Select: React.FC<SelectProps> = React.memo(({
  label,
  selectedValue,
  onValueChange,
  items,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSelectItem = useCallback((itemId: string | number) => {
    if (itemId !== '' && itemId !== undefined) {
      onValueChange(itemId);
    }
    setModalVisible(false);
  }, [onValueChange]);

  const selectedItem = useMemo(() => 
    items.find(item => item.id === selectedValue),
    [items, selectedValue]
  );

  const modalData = useMemo(() => 
    [{ id: '', name: `-- SELECCIONA ${label.toUpperCase()} --` }, ...items],
    [items, label]
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.iosButton}
          onPress={handleOpenModal}
        >
          <Text style={selectedValue ? styles.iosButtonText : styles.iosButtonPlaceholder}>
            {selectedItem ? selectedItem.name : `-- SELECCIONA ${label.toUpperCase()} --`}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={handleCloseModal} activeOpacity={1}>
            <View style={styles.modalContent}>
              <FlatList
                data={modalData}
                keyExtractor={(item, index) => `select-${item.id?.toString() || index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectItem(item.id || '')}
                  >
                    <Text style={selectedValue === item.id ? styles.selectedItem : undefined}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Android (default)
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedValue ?? undefined}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item
          label={`-- SELECCIONA ${label.toUpperCase()} --`}
          value=""
        />
        {items.map((item, index) => (
          <Picker.Item
            key={item.id?.toString() || index.toString()}
            label={item.name}
            value={item.id}
          />
        ))}
      </Picker>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  iosButton: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  iosButtonText: {
    color: '#000',
    fontSize: 16,
  },
  iosButtonPlaceholder: {
    color: '#fb8436',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
    paddingVertical: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    color: '#fb8436',
    fontWeight: 'bold',
  },
});

export default React.memo(Select);
