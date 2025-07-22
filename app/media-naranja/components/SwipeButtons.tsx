import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface Props {
  onLike: () => void;
  onNope: () => void;
  onDetail: () => void;
}

export default function SwipeButtons({ onLike, onNope, onDetail }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.nope]} onPress={onNope}>
        <Ionicons name="close" size={36} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.detail]} onPress={onDetail}>
        <FontAwesome name="arrow-right" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.like]} onPress={onLike}>
        <Ionicons name="flame" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  nope: {
    backgroundColor: '#e74c3c',
  },
  like: {
    backgroundColor: '#ff9800',
  },
  detail: {
    backgroundColor: '#2980b9',
  },
});
