import React, { useState, useEffect } from "react";
import { Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from '../context/AuthContext';
import LoginModal from '../media-naranja/components/LoginModal';
import { supabase } from '../supabase';

const ChatButton = () => {
  const [color, setColor] = useState("#007AFF");
  const router = useRouter();
  const { session } = useAuth();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  // Función para generar un color aleatorio
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

    useEffect(() => {
      const interval = setInterval(() => {
        setColor(getRandomColor());
      }, 300); // Cambia cada segundo

      return () => clearInterval(interval); // Limpieza del intervalo
    }, []);

  const handleChatPress = () => {
    if (session) {
      router.push('../chatroom');
    } else {
      setLoginModalVisible(true);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    if (!username || !password) {
      setLoginError('Campos Obligatorios');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        setLoginError('Usuario o contraseña incorrectos');
        return;
      }

      if (data.user) {
        setLoginModalVisible(false);
        setLoginError(undefined);
        router.push('../chatroom');
      }
    } catch (error) {
      setLoginError('Error al iniciar sesión');
    }
  };

  return (
    <>
    <Pressable onPress={handleChatPress}>
      <Text
        style={{
          color,
          fontSize: 24,
          paddingHorizontal: 20,
          //textDecorationLine: "underline",
        }}
      >
        Chat
      </Text>
    </Pressable>
    
    <LoginModal
      visible={loginModalVisible}
      onLogin={handleLogin}
      onClose={() => setLoginModalVisible(false)}
      onGoToRegister={() => {
        setLoginModalVisible(false);
        router.push('/user/registerUser');
      }}
      error={loginError}
    />
    </>
  );
};

export default ChatButton;
