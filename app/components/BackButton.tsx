import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  /** The route to navigate to when pressed */
  route: string;
  /** Custom icon name (default: 'arrow-back') */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Custom icon size (default: 24) */
  iconSize?: number;
  /** Custom icon color (default: '#333') */
  iconColor?: string;
  /** Custom background color (default: '#f0f0f0') */
  backgroundColor?: string;
  /** Custom padding (default: 8) */
  padding?: number;
  /** Custom border radius (default: 20) */
  borderRadius?: number;
  /** Additional custom styles */
  style?: object;
  /** Custom onPress handler (overrides default navigation) */
  onPress?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  route,
  iconName = 'arrow-back',
  iconSize = 24,
  iconColor = '#333',
  backgroundColor = '#f0f0f0',
  padding = 8,
  borderRadius = 20,
  style,
  onPress
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(route as any);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[
        styles.button,
        {
          padding,
          borderRadius,
          backgroundColor,
        },
        style
      ]}
    >
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;
