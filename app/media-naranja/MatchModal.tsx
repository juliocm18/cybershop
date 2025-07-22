import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  userPhoto: string;
  matchPhoto: string;
  matchedProfile?: any;
}

export default function MatchModal({ visible, onClose, userPhoto, matchPhoto, matchedProfile }: Props) {
  const [animation] = useState(new Animated.Value(0));
  const [localVisible, setLocalVisible] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const { session } = useAuth();
  
  
  // Use local state to ensure modal stays visible
  React.useEffect(() => {
    if (visible) {
      setLocalVisible(true);
    }
  }, [visible]);
  
  useEffect(() => {
    if (localVisible) {
      // Reset and start animation when modal becomes visible
      animation.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [localVisible]);
  
  // Function to find or create an individual room between two users
  const findOrCreateIndividualRoom = async (currentUserId: string, recipientId: string) => {
    try {
      // First check if a room already exists between these users
      const { data: existingRoom, error: findError } = await supabase
        .from('rooms')
        .select(`
          id,
          name,
          type,
          created_by,
          recipient_id,
          is_private
        `)
        .eq('type', 'individual')
        .or(`and(created_by.eq.${currentUserId},recipient_id.eq.${recipientId}),and(created_by.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding individual room:', findError);
        return null;
      }

      // If room exists, return it
      if (existingRoom) return existingRoom.id;

      // Otherwise create a new room
      const { data: newRoom, error: createError } = await supabase
        .from('rooms')
        .insert({
          type: 'individual',
          created_by: currentUserId,
          recipient_id: recipientId,
          is_private: true
        })
        .select()
        .single();

      if (createError || !newRoom) {
        console.error('Error creating individual room:', createError);
        return null;
      }

      return newRoom.id;
    } catch (error) {
      console.error('Error in findOrCreateIndividualRoom:', error);
      return null;
    }
  };
  
  const handleStartChat = async () => {
    // If we have a matched profile and current user, create/find room and navigate
    if (matchedProfile && session?.user) {
      setIsCreatingRoom(true);
      
      try {
        // Find or create a room between the current user and the matched user
        const roomId = await findOrCreateIndividualRoom(session.user.id, matchedProfile.id);
        
        // Close the modal
        setLocalVisible(false);
        onClose();
        
        // Small delay to allow modal to close smoothly
        setTimeout(() => {
          setIsCreatingRoom(false);
          
          // Navigate to the chatroom with the matched user and pass necessary parameters
          if (roomId) {
            router.push({
              pathname: '/chatroom',
              params: {
                roomIdParam: roomId,
                recipientId: matchedProfile.id,
                chatType: 'individual'
              }
            });
          } else {
            // Handle error - could not create room
            console.error('Could not create or find chat room');
          }
        }, 300);
      } catch (error) {
        console.error('Error starting chat:', error);
        setIsCreatingRoom(false);
        setLocalVisible(false);
        onClose();
      }
    } else {
      // Just close the modal if we don't have necessary data
      setLocalVisible(false);
      onClose();
    }
  };
  
  const handleClose = () => {
    // First set local state to false
    setLocalVisible(false);
    // Then call the parent's onClose
    onClose();
  };
  
  // Animation styles
  const animatedScale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.1, 1],
  });
  
  const animatedOpacity = animation.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 1],
  });
  
  // Ensure we have valid photo URLs
  const safeUserPhoto = userPhoto || 'https://via.placeholder.com/150';
  const safeMatchPhoto = matchPhoto || 'https://via.placeholder.com/150';
  
  return (
    <Modal visible={visible || localVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalBox,
            { 
              opacity: animatedOpacity,
              transform: [{ scale: animatedScale }]
            }
          ]}
        >
          <Text style={styles.title}>¡Es un Match!</Text>
          <View style={styles.photosRow}>
            <Image 
              source={{ uri: safeUserPhoto }} 
              style={styles.photo}
              defaultSource={require('../../assets/images/default-avatar.png')} 
            />
            <Image 
              source={{ uri: safeMatchPhoto }} 
              style={styles.photo}
              defaultSource={require('../../assets/images/default-avatar.png')} 
            />
          </View>
          <Text style={styles.message}>Cuando ambos dan like, se prende la magia y se desbloquea el chat.</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleStartChat}
              disabled={isCreatingRoom}
            >
              {isCreatingRoom ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Empezar conversación</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleClose}
              disabled={isCreatingRoom}
            >
              <Text style={styles.secondaryButtonText}>Seguir explorando</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
    width: 320,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
  },
  photo: {
    width: 78,
    height: 78,
    borderRadius: 39,
    marginHorizontal: 8,
    borderWidth: 3,
    borderColor: '#ff9800',
  },
  message: {
    fontSize: 15,
    color: '#444',
    marginBottom: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 15,
  },
});
