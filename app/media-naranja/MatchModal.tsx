import React from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';

interface Props {
  visible: boolean;
  onClose: () => void;
  userPhoto: string;
  matchPhoto: string;
  matchedProfile?: any;
}

export default function MatchModal({ visible, onClose, userPhoto, matchPhoto, matchedProfile }: Props) {
  const [animation] = React.useState(new Animated.Value(0));
  const [localVisible, setLocalVisible] = React.useState(false);
  
  
  // Use local state to ensure modal stays visible
  React.useEffect(() => {
    if (visible) {
      setLocalVisible(true);
    }
  }, [visible]);
  
  React.useEffect(() => {
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
  
  const handleStartChat = () => {
    // Close the modal first
    setLocalVisible(false);
    onClose();
    
    // If we have a matched profile, navigate to the chat
    if (matchedProfile) {
      // Navigate to chat with this user
      setTimeout(() => {
        // Navigate to the chatroom with the matched user
        router.push('/chatroom');
      }, 300); // Small delay to allow modal to close smoothly
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
            <TouchableOpacity style={styles.button} onPress={handleStartChat}>
              <Text style={styles.buttonText}>Empezar conversación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
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
