import React, { useState } from "react";
import { View, StyleSheet, Platform, Modal, TouchableOpacity, FlatList } from "react-native";
import { Text, HelperText } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

interface SelectProps {
  label: string;
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  items: { id: string; name: string }[];
}

const Select: React.FC<SelectProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (Platform.OS === 'ios') {
    const selectedItem = items.find(item => item.id === selectedValue);
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.iosButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={selectedValue ? styles.iosButtonText : styles.iosButtonPlaceholder}>
            {selectedItem ? selectedItem.name : `-- SELECCIONA ${label.toUpperCase()} --`}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <FlatList
                data={[{ id: '', name: `-- SELECCIONA ${label.toUpperCase()} --` }, ...items]}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      onValueChange(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={selectedValue === item.id ? styles.selectedItem : undefined}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
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
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        mode="dropdown"
      >
        <Picker.Item
          style={{ color: selectedValue === "" ? "#fb8436" : "#000" }}
          label={`-- SELECCIONA ${label.toUpperCase()} --`}
          value=""
        />
        {items.map((item) => (
          <Picker.Item
            key={item.id}
            label={item.name}
            value={item.id}
            style={{ color: selectedValue === item.id ? "#fb8436" : "#000" }}
          />
        ))}
      </Picker>
    </View>
  );
};

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

export default Select;
