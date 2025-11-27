import React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Platform, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';

interface AppHeaderProps {
  userEmail?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userEmail = '', showBackButton = true, onBack }) => {
const { signOut } = useAuth();
  const handleSignOut = async () => {
    Alert.alert(
          'Cerrar Sesión',
          '¿Estás seguro de que quieres cerrar sesión?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Salir',
              style: 'destructive',
              onPress: async () => {
                try {
                  await signOut();
                  router.replace('/main-menu');
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                  Alert.alert('Error', 'No se pudo cerrar sesión. Por favor, intenta de nuevo.');
                  // Even if there's an error, redirect to main menu
                  router.replace('/main-menu');
                }
              }
            }
          ]
        );
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <BackButton 
            route={onBack ? "/media-naranja/Home" : "/main-menu"}
            onPress={onBack}
            style={{ marginRight: 12 }}
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.centerSection} 
        onPress={() => router.push('../user/userProfile')}
      >
        <Animated.Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
          Bienvenido, {userEmail.substring(0, 12)}
        </Animated.Text>
      </TouchableOpacity>
      
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  centerSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 70,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'left',
    marginTop: 12,
  },
  signOutButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffeaea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AppHeader;
