import { NativeModules, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { PhotoPickerModule } = NativeModules;

/**
 * Android Photo Picker wrapper with development fallback
 * - Production: Uses native Android Photo Picker (Android 11+) without requiring storage permissions
 * - Development: Falls back to expo-image-picker when native module is not available
 * - iOS: Not used, app uses expo-image-picker directly
 * 
 * @see https://developer.android.com/training/data-storage/shared/photopicker
 */
class PhotoPicker {
  /**
   * Check if native module is available (only in production builds)
   */
  private isNativeModuleAvailable(): boolean {
    return Platform.OS === 'android' && PhotoPickerModule != null;
  }

  /**
   * Pick a single image from the device (Android only)
   * Falls back to expo-image-picker in development
   * @returns Promise with the selected image URI or null if canceled
   */
  async pickSingleImage(): Promise<string | null> {
    if (Platform.OS !== 'android') {
      throw new Error('PhotoPickerModule is only for Android. Use expo-image-picker directly on iOS.');
    }

    // Fallback to expo-image-picker in development (Expo Go)
    if (!this.isNativeModuleAvailable()) {
      console.warn('[PhotoPicker] Native module not available, using expo-image-picker fallback');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    }

    try {
      const uri = await PhotoPickerModule.pickSingleImage();
      return uri;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  /**
   * Pick a single video from the device (Android only)
   * Falls back to expo-image-picker in development
   * @returns Promise with the selected video URI or null if canceled
   */
  async pickSingleVideo(): Promise<string | null> {
    if (Platform.OS !== 'android') {
      throw new Error('PhotoPickerModule is only for Android. Use expo-image-picker directly on iOS.');
    }

    // Fallback to expo-image-picker in development (Expo Go)
    if (!this.isNativeModuleAvailable()) {
      console.warn('[PhotoPicker] Native module not available, using expo-image-picker fallback');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 300,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    }

    try {
      const uri = await PhotoPickerModule.pickSingleVideo();
      return uri;
    } catch (error) {
      console.error('Error picking video:', error);
      throw error;
    }
  }

  /**
   * Pick multiple images from the device (Android only)
   * Falls back to expo-image-picker in development
   * @param maxImages Maximum number of images to select (default: 5)
   * @returns Promise with array of selected image URIs or empty array if canceled
   */
  async pickMultipleImages(maxImages: number = 5): Promise<string[]> {
    if (Platform.OS !== 'android') {
      throw new Error('PhotoPickerModule is only for Android. Use expo-image-picker directly on iOS.');
    }

    // Fallback to expo-image-picker in development (Expo Go)
    if (!this.isNativeModuleAvailable()) {
      console.warn('[PhotoPicker] Native module not available, using expo-image-picker fallback');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      return result.assets.map(asset => asset.uri);
    }

    try {
      const uris = await PhotoPickerModule.pickMultipleImages(maxImages);
      return uris || [];
    } catch (error) {
      console.error('Error picking multiple images:', error);
      throw error;
    }
  }
}

export default new PhotoPicker();
