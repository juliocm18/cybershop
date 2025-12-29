import { NativeModules, Platform } from 'react-native';

const { PhotoPickerModule } = NativeModules;

/**
 * Android Photo Picker wrapper
 * Uses native Android Photo Picker (Android 11+) without requiring storage permissions
 * For iOS, this module is not used - the app continues using expo-image-picker directly
 * 
 * @see https://developer.android.com/training/data-storage/shared/photopicker
 */
class PhotoPicker {
  /**
   * Pick a single image from the device (Android only)
   * @returns Promise with the selected image URI or null if canceled
   */
  async pickSingleImage(): Promise<string | null> {
    if (Platform.OS !== 'android') {
      throw new Error('PhotoPickerModule is only for Android. Use expo-image-picker directly on iOS.');
    }

    if (!PhotoPickerModule) {
      throw new Error('PhotoPickerModule is not available. Make sure the native module is properly linked.');
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
   * @returns Promise with the selected video URI or null if canceled
   */
  async pickSingleVideo(): Promise<string | null> {
    if (Platform.OS !== 'android') {
      throw new Error('PhotoPickerModule is only for Android. Use expo-image-picker directly on iOS.');
    }

    if (!PhotoPickerModule) {
      throw new Error('PhotoPickerModule is not available. Make sure the native module is properly linked.');
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
   * @param maxImages Maximum number of images to select (default: 5)
   * @returns Promise with array of selected image URIs or empty array if canceled
   */
  async pickMultipleImages(maxImages: number = 5): Promise<string[]> {
    if (Platform.OS !== 'android') {
      throw new Error('PhotoPickerModule is only for Android. Use expo-image-picker directly on iOS.');
    }

    if (!PhotoPickerModule) {
      throw new Error('PhotoPickerModule is not available. Make sure the native module is properly linked.');
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
