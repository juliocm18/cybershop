import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Alert } from "react-native";
import { crashLogger } from "../../utils/crashlytics";

export const safePickImage = async (): Promise<string | null> => {
  try {
    await crashLogger.setBreadcrumb('Starting image picker', 'Media');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [10, 10],
      quality: 0.8,
      selectionLimit: 1,
      mediaTypes: ["images"],
    });

    if (result.canceled || result.assets.length === 0) {
      await crashLogger.setBreadcrumb('Image picker cancelled', 'Media');
      return null;
    }

    const image = result.assets[0];

    if (image.width >= 1000) {
      try {
        await crashLogger.setBreadcrumb('Resizing large image', 'Media');
        
        const manipResult = await manipulateAsync(
          image.uri,
          [{ resize: { width: 1000, height: 1000 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
        
        await crashLogger.setBreadcrumb('Image resized successfully', 'Media');
        return manipResult.uri;
      } catch (error) {
        await crashLogger.logError(error as Error, 'ImageResize');
        Alert.alert("Error", "No se pudo comprimir la imagen");
        return null;
      }
    }

    if (!["image/jpeg", "image/png"].includes(image.mimeType || "")) {
      Alert.alert("Error", "Solo son permitidos JPG, JPEG, y PNG.");
      return null;
    }

    await crashLogger.setBreadcrumb('Image selected successfully', 'Media');
    return image.uri;
  } catch (error) {
    await crashLogger.logError(error as Error, 'SafePickImage');
    Alert.alert("Error", "No se pudo seleccionar la imagen");
    return null;
  }
};

export const safePickMultipleImages = async (maxImages: number = 5): Promise<string[]> => {
  try {
    await crashLogger.setBreadcrumb(`Starting multiple image picker (max: ${maxImages})`, 'Media');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
      selectionLimit: maxImages,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (result.canceled || result.assets.length === 0) {
      await crashLogger.setBreadcrumb('Multiple image picker cancelled', 'Media');
      return [];
    }

    const processedUris: string[] = [];
    
    for (const image of result.assets) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(image.mimeType || "")) {
        console.warn("Skipping non-JPG/PNG image");
        continue;
      }

      if (image.width > 1000 || image.height > 1000) {
        try {
          const manipResult = await manipulateAsync(
            image.uri,
            [{ resize: { width: 1000, height: 1000 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
          );
          processedUris.push(manipResult.uri);
        } catch (error) {
          await crashLogger.logError(error as Error, 'MultipleImageResize');
          console.error("Error compressing image:", error);
          continue;
        }
      } else {
        processedUris.push(image.uri);
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
