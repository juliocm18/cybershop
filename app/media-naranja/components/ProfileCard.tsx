import { clientProfile } from '@/app/user/model';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Props {
  profile: clientProfile;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  return age;
}

export default function ProfileCard({ profile }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: profile.avatar_url }} style={styles.photo} />
      <Text style={styles.name}>{profile.name}, {calculateAge(new Date(profile.birth_date))}</Text>
      <Text style={styles.info}>{profile.zodiac_sign} · {profile.profession}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  photo: {
    width: 260,
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: '#666',
  },
});
