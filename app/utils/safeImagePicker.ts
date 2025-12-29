import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Alert, Platform } from "react-native";
import { crashLogger } from "../../utils/crashlytics";
import PhotoPicker from "./PhotoPicker";
import * as ImagePicker from "expo-image-picker";

export const safePickImage = async (): Promise<string | null> => {
  try {
    await crashLogger.setBreadcrumb('Starting image picker', 'Media');
    
    let uri: string | null = null;

    if (Platform.OS === 'android') {
      // Android: Use native Photo Picker (no permissions required)
      uri = await PhotoPicker.pickSingleImage();
    } else {
      // iOS: Use expo-image-picker (original implementation)
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [10, 10],
        quality: 0.8,
        selectionLimit: 1,
        mediaTypes: ["images"],
      });

      if (!result.canceled && result.assets.length > 0) {
        uri = result.assets[0].uri;
      }
    }

    if (!uri) {
      await crashLogger.setBreadcrumb('Image picker cancelled', 'Media');
      return null;
    }

    try {
      await crashLogger.setBreadcrumb('Resizing image', 'Media');
      
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 1000, height: 1000 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      
      await crashLogger.setBreadcrumb('Image resized successfully', 'Media');
      return manipResult.uri;
    } catch (error) {
      await crashLogger.logError(error as Error, 'ImageResize');
      Alert.alert("Error", "No se pudo procesar la imagen");
      return null;
    }
  } catch (error) {
    await crashLogger.logError(error as Error, 'SafePickImage');
    Alert.alert("Error", "No se pudo seleccionar la imagen");
    return null;
  }
};

export const safePickMultipleImages = async (maxImages: number = 5): Promise<string[]> => {
  try {
    await crashLogger.setBreadcrumb(`Starting multiple image picker (max: ${maxImages})`, 'Media');
    
    let uris: string[] = [];

    if (Platform.OS === 'android') {
      // Android: Use native Photo Picker
      uris = await PhotoPicker.pickMultipleImages(maxImages);
    } else {
      // iOS: Use expo-image-picker (original implementation)
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        selectionLimit: maxImages,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        uris = result.assets.map(asset => asset.uri);
      }
    }

    if (!uris || uris.length === 0) {
      await crashLogger.setBreadcrumb('Multiple image picker cancelled', 'Media');
      return [];
    }

    const processedUris: string[] = [];
    
    for (const uri of uris) {
      try {
        const manipResult = await manipulateAsync(
          uri,
          [{ resize: { width: 1000, height: 1000 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
        processedUris.push(manipResult.uri);
      } catch (error) {
        await crashLogger.logError(error as Error, 'MultipleImageResize');
        console.error("Error processing image:", error);
        continue;
      }
    }

    await crashLogger.logCustomEvent('MultipleImagesSelected', { count: processedUris.length });
    return processedUris;
  } catch (error) {
    await crashLogger.logError(error as Error, 'SafePickMultipleImages');
    Alert.alert("Error", "No se pudieron cargar las imágenes");
    return [];
  }
};
