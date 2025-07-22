import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface Props {
  hobbies: string[];
}

const HOBBY_ICONS: Record<string, string> = {
  arte: 'palette',
  viajar: 'plane',
  gatos: 'cat',
  tecnología: 'laptop',
  deporte: 'dumbbell',
  cine: 'film',
};

export default function HobbiesIcons({ hobbies }: Props) {
  return (
    <View style={styles.container}>
      {hobbies.map(hobby => (
        <View style={styles.item} key={hobby}>
          <FontAwesome5 name={HOBBY_ICONS[hobby] || 'star'} size={18} color="#ff9800" />
          <Text style={styles.text}>{hobby}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  text: {
    marginLeft: 6,
    fontSize: 15,
    color: '#555',
  },
});
