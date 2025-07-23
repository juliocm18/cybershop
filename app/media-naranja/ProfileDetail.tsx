import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import AppHeader from './components/AppHeader';
import HobbiesIcons from './components/HobbiesIcons';
import { clientProfile } from '@/app/user/model';
import { supabase } from '../supabase';
import { useAuth } from '@/app/context/AuthContext';

function calculateAge(birthDate: string): number {
  const today = new Date();
  const age = today.getFullYear() - new Date(birthDate).getFullYear();
  const month = today.getMonth() - new Date(birthDate).getMonth();
  if (month < 0 || (month === 0 && today.getDate() < new Date(birthDate).getDate())) {
    return age - 1;
  }
  return age;
}

interface Props {
  profile: clientProfile;
  onBack: () => void;
  userEmail?: string;
}

export default function ProfileDetail({ profile, onBack, userEmail }: Props) {
  const { session } = useAuth();
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const fetchUserPhotos = async () => {
    if (!session?.user?.id) return;
    try {
      // Fetch photos from user_photos table
      const { data, error } = await supabase
        .from('user_photos')
        .select('photo_url')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const photos = data ? data.map(item => item.photo_url) : [];
      photos.push(profile.avatar_url);
      setUserPhotos(photos);
    } catch (error) {
      console.error('Error fetching user photos:', error);
    }
  };
  useEffect(() => {
    fetchUserPhotos();
  }, [session]);
  return (
    <View style={{ flex: 1 }}>
      <AppHeader userEmail={userEmail} showBackButton={true} onBack={onBack} />
      <ScrollView contentContainerStyle={[styles.container, { marginTop: Platform.OS === 'ios' ? 140 : 110 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {userPhotos.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.photo} />
          ))}
        </ScrollView>
        <Text style={styles.name}>{profile.name}, {calculateAge(profile.birth_date)}</Text>
        <Text style={styles.info}>{profile.zodiac_sign} · {profile.profession}</Text>
        <Text style={styles.section}>Descripción</Text>
        <Text style={styles.desc}>{profile.description}</Text>
        <Text style={styles.section}>Hobbies</Text>
        <HobbiesIcons hobbies={profile.hobbies} />
        <Text style={styles.section}>Datos</Text>
        <Text style={styles.detail}>Sexo: {profile.gender}</Text>
        <Text style={styles.detail}>Prefiere: {profile.sexual_preference}</Text>
        <Text style={styles.detail}>Profesión: {profile.profession}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    marginTop: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backText: {
    color: '#2980b9',
    fontSize: 17,
  },
  gallery: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 12,
  },
  photo: {
    width: 210,
    height: 260,
    borderRadius: 16,
    marginRight: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    color: '#ff9800',
  },
  desc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  detail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
});
