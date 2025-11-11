import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert, Image, ImageSourcePropType } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import MediaNaranjaLoginModal from '../media-naranja/components/LoginModal';
import { supabase } from '../supabase';
import BackButton from '../components/BackButton';

// Define your menu items here
interface MenuItem {
  key: string;
  image: ImageSourcePropType;
  link: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'shop',
    image: require('../../assets/images/apps/mall2.jpeg'),
    link: '/home/home'
  },
  {
    key: 'orders',
    image: require('../../assets/images/apps/chat.jpeg'),
    link: '/chatroom'
  },
  {
    key: 'profile',
    image: require('../../assets/images/apps/media-naranja.jpeg'),
    link: '/media-naranja/Home'
  },
  {
    key: 'games',
    image: require('../../assets/images/apps/mall.jpeg'),
    link: ''
  },
  // {
  //   key: 'wallet',
  //   image: require('../../assets/images/apps/mall.jpeg'),
  //   link: ''
  // },  
  // {
  //   key: 'support',
  //   image: require('../../assets/images/apps/mall.jpeg'),
  //   link: ''
  // },
];


const numColumns = 2;
const ITEM_SIZE = (Dimensions.get('window').width - 48) / numColumns;

interface MenuSquareProps {
  item: MenuItem;
  onMediaNaranjaPress: () => void;
  onChatPress: () => void;
}

const MenuSquare: React.FC<MenuSquareProps> = ({ item, onMediaNaranjaPress, onChatPress }) => {
  return React.createElement(
    TouchableOpacity,
    {
      style: styles.square,
      onPress: () => {
        if (item.link === '') {
          Alert.alert("Aviso","Estamos trabajando en esta funcionalidad");
        } else if (item.key === 'profile') {
          onMediaNaranjaPress();
        } else if (item.key === 'orders') {
          onChatPress();
        } else {
          router.push(item.link as any);
        }
      },
    },
    React.createElement(Image, { source: item.image, style: styles.image, resizeMode: 'cover' })
  );
};

const MainMenu: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  const handleMediaNaranjaPress = () => {
    if (session) {
      router.push('/media-naranja/Home');
    } else {
      setLoginModalVisible(true);
    }
  };

  const handleChatPress = () => {
    if (session) {
      router.push('/chatroom');
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
        router.push('/media-naranja/Home');
      }
    } catch (error) {
      setLoginError('Error al iniciar sesión');
    }
  };

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(
      View,
      { style: styles.headerContainer },
      React.createElement(BackButton, {
        route: '/',
        style: { marginRight: 10 }
      }),
      React.createElement(
        Text,
        { style: styles.header },
        'Seleccione su Aplicativo'
      )
    ),
    React.createElement(
      FlatList as new () => FlatList<MenuItem>,
      {
        data: MENU_ITEMS,
        renderItem: ({ item }: { item: MenuItem }) => React.createElement(MenuSquare, { item, onMediaNaranjaPress: handleMediaNaranjaPress, onChatPress: handleChatPress }),
        keyExtractor: (item: MenuItem) => item.key,
        numColumns: numColumns,
        contentContainerStyle: styles.menuGrid,
        columnWrapperStyle: styles.row,
        showsVerticalScrollIndicator: false,
      }
    ),
    React.createElement(MediaNaranjaLoginModal, {
      visible: loginModalVisible,
      onLogin: handleLogin,
      onClose: () => setLoginModalVisible(false),
      onGoToRegister: () => {
        setLoginModalVisible(false);
        router.push('/user/registerUser');
      },
      error: loginError
    })
  );
};

export default MainMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fb8436',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 16,
  },
  menuGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  square: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 18,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 25,
  },
});
