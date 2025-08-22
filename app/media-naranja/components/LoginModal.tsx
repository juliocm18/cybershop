import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface LoginModalProps {
  visible: boolean;
  onLogin: (username: string, password: string) => void;
  onClose: () => void;
  onGoToRegister: () => void;
  error?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onLogin, onClose, onGoToRegister, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={() => onLogin(username, password)}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
          <Text style={styles.link}>
            ¿No tienes una cuenta? <Text style={styles.linkText} onPress={() => onGoToRegister()}>Regístrate</Text>
          </Text>
          <TouchableOpacity style={styles.mainMenuButton} onPress={() => router.push('/main-menu')}>
            <Text style={styles.mainMenuButtonText}>Ir al Menú Principal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainMenuButton: {
    marginTop: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mainMenuButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    color: '#d0021b',
    marginBottom: 10,
  },
  link: {
    color: '#0084ff',
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
  },
  linkText: {
    color: '#0084ff',
    fontWeight: 'bold',
  },
});

export default LoginModal;
