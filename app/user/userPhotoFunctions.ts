import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Alert } from "react-native";
import { supabase } from "../supabase";

// Function to pick multiple images from gallery
export const pickMultipleImages = async (maxImages: number = 5): Promise<string[]> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: maxImages,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return [];
    }

    // Process each selected image
    const processedUris: string[] = [];
    
    for (const image of result.assets) {
      // Validate image type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(image.mimeType || "")) {
        console.warn("Skipping non-JPG/PNG image");
        continue;
      }

      // Resize large images
      if (image.width > 1000 || image.height > 1000) {
        try {
          const manipResult = await manipulateAsync(
            image.uri,
            [{ resize: { width: 1000, height: 1000 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
          );
          processedUris.push(manipResult.uri);
        } catch (error) {
          console.error("Error compressing image:", error);
          continue;
        }
      } else {
        processedUris.push(image.uri);
      }
    }

    return processedUris;
  } catch (error) {
    console.error("Error picking images:", error);
    Alert.alert("Error", "No se pudieron cargar las imágenes");
    return [];
  }
};

// Convert URI to FormData for upload
const uriToFormData = async (uri: string): Promise<FormData> => {
  const fileExt = uri.split(".").pop() || "jpg";
  const fileName = `${Date.now()}.${fileExt}`;

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: fileName,
    type: `image/${fileExt}`,
  } as any);

  return formData;
};

// Upload a single image to Supabase storage
export const uploadUserPhoto = async (uri: string, userId: string): Promise<string | null> => {
  try {
    const formData = await uriToFormData(uri);
    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `user-photos/${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from("user-photos")
      .upload(filePath, formData, {
        contentType: `image/${fileExt}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const publicUrl = supabase.storage
      .from("user-photos")
      .getPublicUrl(filePath).data.publicUrl;
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

// Upload multiple images and return array of URLs
export const uploadMultiplePhotos = async (
  uris: string[],
  userId: string
): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const uri of uris) {
    const url = await uploadUserPhoto(uri, userId);
    if (url) {
      uploadedUrls.push(url);
    }
  }

  return uploadedUrls;
};

// Get user photos from Supabase
export const getUserPhotos = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_photos')
      .select('photo_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data ? data.map(item => item.photo_url) : [];
  } catch (error) {
    console.error("Error fetching user photos:", error);
    return [];
  }
};

// Save photo URLs to user_photos table
export const saveUserPhotos = async (
  userId: string,
  photoUrls: string[]
): Promise<boolean> => {
  try {
    const photosToInsert = photoUrls.map(url => ({
      user_id: userId,
      photo_url: url,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('user_photos')
      .insert(photosToInsert);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving user photos:", error);
    return false;
  }
};

// Delete a user photo
export const deleteUserPhoto = async (
  userId: string,
  photoUrl: string
): Promise<boolean> => {
  try {
    // Delete from database
    const { error: dbError } = await supabase
      .from('user_photos')
      .delete()
      .eq('user_id', userId)
      .eq('photo_url', photoUrl);

    if (dbError) throw dbError;

    // Extract file path from URL to delete from storage
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `user-photos/${userId}/${fileName}`;

    // Delete from storage (this is optional as it might fail if URL format changes)
    try {
      await supabase.storage
        .from('user-photos')
        .remove([filePath]);
    } catch (storageError) {
      console.warn("Could not delete from storage:", storageError);
      // Continue anyway as we've deleted from the database
    }

    return true;
  } catch (error) {
    console.error("Error deleting user photo:", error);
    return false;
  }
};
