import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import AppHeader from './components/AppHeader';

interface MatchProfile {
  id: string;
  name: string;
  avatar_url: string;
  bio?: string;
  created_at: string;
}

export default function MatchProfiles() {
  const { session } = useAuth();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const userEmail = session?.user?.email || '';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      
      // Get all users that the current user has liked
      const { data: userLikes, error: userLikesError } = await supabase
        .from('likes')
        .select('liked_user_id')
        .eq('user_id', session.user.id);

      if (userLikesError) {
        console.error('Error fetching user likes:', userLikesError);
        setLoading(false);
        return;
      }

      if (!userLikes || userLikes.length === 0) {
        setLoading(false);
        return;
      }

      // Extract the IDs of users that the current user has liked
      const likedUserIds = userLikes.map(like => like.liked_user_id);

      // Get all users who have liked the current user
      const { data: likedByUsers, error: likedByError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('liked_user_id', session.user.id);

      if (likedByError) {
        console.error('Error fetching users who liked current user:', likedByError);
        setLoading(false);
        return;
      }

      if (!likedByUsers || likedByUsers.length === 0) {
        setLoading(false);
        return;
      }

      // Extract the IDs of users who have liked the current user
      const likedByUserIds = likedByUsers.map(like => like.user_id);

      // Find mutual likes (matches) - users who the current user has liked AND who have liked the current user back
      const mutualLikeIds = likedUserIds.filter(id => likedByUserIds.includes(id));

      if (mutualLikeIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch the profile data for all matched users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', mutualLikeIds);

      if (profilesError) {
        console.error('Error fetching match profiles:', profilesError);
        setLoading(false);
        return;
      }

      setMatches(profilesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchMatches:', error);
      setLoading(false);
    }
  };

  const handleGoToChat = async (matchProfile: MatchProfile) => {
    if (!session?.user?.id) return;
    
    try {
      // Find or create a room between the current user and the matched user
      const { data: existingRoom, error: findError } = await supabase
        .from('rooms')
        .select('id')
        .or(`and(created_by.eq.${session.user.id},recipient_id.eq.${matchProfile.id}),and(created_by.eq.${matchProfile.id},recipient_id.eq.${session.user.id})`)
        .eq('type', 'individual')
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding chat room:', findError);
        return;
      }

      let roomId;
      
      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
        // Create a new room
        const { data: newRoom, error: createError } = await supabase
          .from('rooms')
          .insert({
            type: 'individual',
            created_by: session.user.id,
            recipient_id: matchProfile.id,
            is_private: true
          })
          .select()
          .single();

        if (createError || !newRoom) {
          console.error('Error creating chat room:', createError);
          return;
        }

        roomId = newRoom.id;
      }

      // Navigate to the chatroom
      router.push({
        pathname: '/chatroom',
        params: {
          roomIdParam: roomId,
          recipientId: matchProfile.id,
          chatType: 'individual'
        }
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
    }
  };

  const handleViewProfile = (matchProfile: MatchProfile) => {
    router.push({
      pathname: '/media-naranja/ProfileDetail',
      params: { profileId: matchProfile.id }
    });
  };

  const handleBlockOrDelete = (matchProfile: MatchProfile) => {
    Alert.alert(
      "Eliminar Match",
      "¿Estás seguro que deseas eliminar este match?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            if (!session?.user?.id) return;
            
            try {
              // Delete the match from the database
              const { error } = await supabase
                .from('matches')
                .delete()
                .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${matchProfile.id}),and(user1_id.eq.${matchProfile.id},user2_id.eq.${session.user.id})`)
                .eq('is_match', true);

              if (error) {
                console.error('Error deleting match:', error);
                return;
              }

              // Remove the match from the local state
              setMatches(prevMatches => prevMatches.filter(match => match.id !== matchProfile.id));
            } catch (error) {
              console.error('Error in handleBlockOrDelete:', error);
            }
          }
        }
      ]
    );
  };

  const renderMatchItem = ({ item }: { item: MatchProfile }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} 
        style={styles.avatar}
        defaultSource={require('../../assets/images/default-avatar.png')} 
      />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.chatButton]} 
          onPress={() => handleGoToChat(item)}
        >
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.profileButton]} 
          onPress={() => handleViewProfile(item)}
        >
          <Text style={styles.buttonText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={() => handleBlockOrDelete(item)}
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader userEmail={userEmail} showBackButton={true} />
      <Text style={styles.title}>Mis Matches</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9800" />
          <Text style={styles.loadingText}>Cargando matches...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes matches todavía.</Text>
          <Text style={styles.emptySubText}>¡Sigue explorando para encontrar tu media naranja!</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 80,
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#ff9800',
  },
  profileButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
