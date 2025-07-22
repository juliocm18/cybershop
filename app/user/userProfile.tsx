import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import AppHeader from '../media-naranja/components/AppHeader';
import HobbiesIcons from '../media-naranja/components/HobbiesIcons';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define the profile type based on the data structure in registerUser
interface UserProfile {
  id: string;
  avatar_url: string;
  name: string;
  birth_date: string;
  phone_number: string;
  email: string;
  gender: string;
  sexual_preference: string;
  profession: string;
  description: string;
  zodiac_sign: string;
  hobbies: string[];
  accept_media_naranja: boolean;
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const age = today.getFullYear() - new Date(birthDate).getFullYear();
  const month = today.getMonth() - new Date(birthDate).getMonth();
  if (month < 0 || (month === 0 && today.getDate() < new Date(birthDate).getDate())) {
    return age - 1;
  }
  return age;
}

export default function UserProfile() {
  const { session } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        setUserProfile(data as UserProfile);
      } catch (error) {
        console.error('Error in profile fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleEditProfile = () => {
    // Navigate to edit profile page (to be implemented)
    router.push('./editProfile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AppHeader userEmail={session?.user?.email || ''} showBackButton={true} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <AppHeader userEmail={session?.user?.email || ''} showBackButton={true} />
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader userEmail={session?.user?.email || ''} showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: userProfile.avatar_url }} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.age}>{calculateAge(userProfile.birth_date)} años</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{userProfile.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{userProfile.phone_number}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{userProfile.gender}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Prefiere: {userProfile.sexual_preference}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{userProfile.profession}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{userProfile.zodiac_sign}</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.description}>{userProfile.description}</Text>
        </View>

        <View style={styles.hobbiesSection}>
          <Text style={styles.sectionTitle}>Mis hobbies</Text>
          <HobbiesIcons hobbies={userProfile.hobbies} />
        </View>

        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.infoRow}>
            <Ionicons 
              name={userProfile.accept_media_naranja ? "heart" : "heart-dislike-outline"} 
              size={20} 
              color={userProfile.accept_media_naranja ? "#ff6b6b" : "#666"} 
            />
            <Text style={styles.infoText}>
              {userProfile.accept_media_naranja 
                ? "Participando en Media Naranja" 
                : "No participando en Media Naranja"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 30,
    marginTop: Platform.OS === 'ios' ? 140 : 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  age: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#ff9800',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hobbiesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mediaSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
