import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';

// Define your menu items here
interface MenuItem {
  key: string;
  title: string;
  iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome';
  icon: string;
  description: string;
  color: string;
  link: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'shop',
    title: 'Catálogo',
    iconType: 'Ionicons',
    icon: 'cart',
    description: 'Busca tiendas, establecimientos, plataformas afiliadas y mucho más.',
    color: '#4a90e2',
    link: '/shop'
    },
  {
    key: 'orders',
    title: 'Chat',
    iconType: 'MaterialIcons',
    icon: 'receipt-long',
    description: 'Conecta con muchas más personas de tu localidad o en el mundo.',
    color: '#50e3c2',
    link: '/chat'
  },
  {
    key: 'profile',
    title: 'Media Naranja',
    iconType: 'FontAwesome',
    icon: 'user-circle',
    description: 'Encuentra a esas personas que buscan lo mismo que tú.',
    color: '#f5a623',
    link: '/media-naranja/Home'
  },
  {
    key: 'support',
    title: 'Soporte',
    iconType: 'Ionicons',
    icon: 'help-circle',
    description: 'Get help',
    color: '#d0021b',
    link: '/support'
  },
];

const ICON_MAP = {
  Ionicons,
  MaterialIcons,
  FontAwesome,
};

const numColumns = 2;
const ITEM_SIZE = (Dimensions.get('window').width - 48) / numColumns;

interface MenuSquareProps {
  item: MenuItem;
}

const MenuSquare: React.FC<MenuSquareProps> = ({ item }) => {
  const IconComponent = ICON_MAP[item.iconType];
  return React.createElement(
    TouchableOpacity,
    {
      style: [styles.square, { backgroundColor: item.color }],
      onPress: () => router.push(item.link),
    },
    React.createElement(IconComponent as typeof Ionicons, { name: item.icon as keyof typeof Ionicons.glyphMap, size: 38, color: "#fff", style: styles.icon }),
    React.createElement(Text, { style: styles.title }, item.title),
    React.createElement(Text, { style: styles.description }, item.description)
  );
};

const MainMenu: React.FC = () => {
  const router = useRouter();

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(
      Text,
      { style: styles.header },
      'Seleccione su App Favorita'
    ),
    React.createElement(
      FlatList as new () => FlatList<MenuItem>,
      {
        data: MENU_ITEMS,
        renderItem: ({ item }: { item: MenuItem }) => React.createElement(MenuSquare, { item }),
        keyExtractor: (item: MenuItem) => item.key,
        numColumns: numColumns,
        contentContainerStyle: styles.menuGrid,
        columnWrapperStyle: styles.row,
        showsVerticalScrollIndicator: false,
      }
    )
  );
};

export default MainMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    padding: 14,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#f5f5f5',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 25,
  },
});
