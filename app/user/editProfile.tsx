import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  TextInput as RNTextInput,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import AppHeader from '../media-naranja/components/AppHeader';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Checkbox } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { pickImage, uploadImage } from '../company/functions';
import { 
  pickMultipleImages, 
  uploadMultiplePhotos, 
  getUserPhotos, 
  saveUserPhotos,
  deleteUserPhoto 
} from './userPhotoFunctions';

// Define the profile type based on the data structure in registerUser
interface UserProfile {
  id: string;
  avatar_url: string;
  name: string;
  birth_date: string;
  phone_number: string;
  email: string;
  gender: string;
  sexual_preference: string;
  profession: string;
  description: string;
  zodiac_sign: string;
  hobbies: string[];
  accept_media_naranja: boolean;
}

export default function EditProfile() {
  const { session } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profession, setProfession] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState('');
  const [sexualPreference, setSexualPreference] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');
  const [acceptMediaNaranja, setAcceptMediaNaranja] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  // Photo gallery state
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  const predefinedHobbies = ["Deportes", "Lectura", "Viajar", "Música", "Cine", "Tecnología", "Arte", "Cocina"];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        setUserProfile(data as UserProfile);
        
        // Initialize form fields with user data
        setName(data.name || '');
        setPhoneNumber(data.phone_number || '');
        setProfession(data.profession || '');
        setDescription(data.description || '');
        setGender(data.gender || '');
        setSexualPreference(data.sexual_preference || '');
        setBirthDate(new Date(data.birth_date));
        setLogoUri(data.avatar_url || null);
        setHobbies(data.hobbies || []);
        setAcceptMediaNaranja(data.accept_media_naranja || false);
        
        // Fetch user photos
        await fetchUserPhotos();
        
      } catch (error) {
        console.error('Error in profile fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session]);
  
  const fetchUserPhotos = async () => {
    if (!session?.user?.id) return;
    
    setPhotosLoading(true);
    try {
      // Fetch photos from user_photos table
      const { data, error } = await supabase
        .from('user_photos')
        .select('photo_url')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const photos = data ? data.map(item => item.photo_url) : [];
      setUserPhotos(photos);
    } catch (error) {
      console.error('Error fetching user photos:', error);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setLogoUri(uri);
    }
  };
  
  const handlePickMultiplePhotos = async () => {
    if (!session?.user?.id) {
      Alert.alert("Error", "Debe iniciar sesión para subir fotos");
      return;
    }
    
    // Check if user already has 5 photos
    if (userPhotos.length >= 5) {
      Alert.alert(
        "Límite alcanzado", 
        "Ya tienes 5 fotos. Elimina alguna para subir más."
      );
      return;
    }
    
    // Calculate how many more photos user can upload
    const remainingSlots = 5 - userPhotos.length;
    
    try {
      setUploadingPhotos(true);
      
      // Pick multiple images (limit to remaining slots)
      const photoUris = await pickMultipleImages(remainingSlots);
      
      if (photoUris.length === 0) {
        setUploadingPhotos(false);
        return;
      }
      
      // Upload photos to storage
      const uploadedUrls = await uploadMultiplePhotos(photoUris, session.user.id);
      
      if (uploadedUrls.length > 0) {
        // Save photo URLs to database
        await saveUserPhotos(session.user.id, uploadedUrls);
        
        // Update state with new photos
        setUserPhotos([...uploadedUrls, ...userPhotos]);
        
        Alert.alert(
          "Éxito", 
          `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'foto subida' : 'fotos subidas'} correctamente`
        );
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      Alert.alert("Error", "Ocurrió un error al subir las fotos");
    } finally {
      setUploadingPhotos(false);
    }
  };
  
  const handleDeletePhoto = async (photoUrl: string) => {
    if (!session?.user?.id) return;
    
    Alert.alert(
      "Eliminar foto",
      "¿Estás seguro que deseas eliminar esta foto?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteUserPhoto(session.user.id, photoUrl);
              
              if (success) {
                // Update state by removing the deleted photo
                setUserPhotos(userPhotos.filter(url => url !== photoUrl));
              } else {
                Alert.alert("Error", "No se pudo eliminar la foto");
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert("Error", "Ocurrió un error al eliminar la foto");
            }
          }
        }
      ]
    );
  };

  const handleToggleHobby = (hobby: string) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter(h => h !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const handleAddCustomHobby = () => {
    if (customHobby.trim() && !hobbies.includes(customHobby.trim())) {
      setHobbies([...hobbies, customHobby.trim()]);
      setCustomHobby('');
    }
  };

  const handleShowDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const handleConfirmDate = (date: Date) => {
    setBirthDate(date);
    setDatePickerVisibility(false);
  };

  const handleCancelDate = () => {
    setDatePickerVisibility(false);
  };

  // Function to calculate zodiac sign
  function getZodiacSign(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Acuario";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Piscis";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Tauro";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Géminis";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cáncer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitario";
    return "Capricornio";
  }

  const handleSaveProfile = async () => {
    if (!session?.user?.id) {
      Alert.alert("Error", "Debe iniciar sesión para actualizar su perfil");
      return;
    }

    // Basic validation
    if (!name || !phoneNumber) {
      setValidationError("El nombre y número de teléfono son obligatorios");
      return;
    }

    // Phone number format validation
    const phoneRegex = /^[0-9]{9}$/; // 9-digit phone number
    if (!phoneRegex.test(phoneNumber)) {
      setValidationError("El número de teléfono debe tener 9 dígitos");
      return;
    }

    setSaving(true);
    setValidationError(null);

    try {
      let avatarUrl = userProfile?.avatar_url || '';
      
      // If user selected a new image and it's different from the current one
      if (logoUri && logoUri !== userProfile?.avatar_url) {
        const uploadedUrl = await uploadImage(logoUri);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const zodiacSign = getZodiacSign(birthDate);
      
      const updatedProfile = {
        name,
        birth_date: birthDate.toISOString().split('T')[0],
        phone_number: phoneNumber,
        gender,
        sexual_preference: sexualPreference,
        profession,
        description,
        zodiac_sign: zodiacSign,
        hobbies,
        accept_media_naranja: acceptMediaNaranja,
      };

      // Only update avatar_url if it changed
      if (avatarUrl !== userProfile?.avatar_url) {
        Object.assign(updatedProfile, { avatar_url: avatarUrl });
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', session.user.id);

      if (error) {
        throw error;
      }

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      router.push('./userProfile');
    } catch (error: any) {
      console.error("Error al actualizar el perfil:", error);
      setValidationError(error.message || "Ocurrió un error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AppHeader userEmail={session?.user?.email || ''} showBackButton={true} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader userEmail={session?.user?.email || ''} showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>        
        {validationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
            <View style={styles.editImageButton}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Toca para cambiar la foto de perfil</Text>
        </View>
        
        {/* Photo Gallery Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Galería de fotos</Text>
          <Text style={styles.sectionSubtitle}>Puedes subir hasta 5 fotos</Text>
          
          {/* Photo Upload Button */}
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={handlePickMultiplePhotos}
            disabled={uploadingPhotos || userPhotos.length >= 5}
          >
            {uploadingPhotos ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  {userPhotos.length >= 5 ? 'Límite alcanzado' : 'Subir fotos'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Photos Grid */}
          {photosLoading ? (
            <ActivityIndicator style={styles.photosLoading} />
          ) : userPhotos.length > 0 ? (
            <View style={styles.photosGrid}>
              {userPhotos.map((photoUrl, index) => (
                <View key={`${photoUrl}-${index}`} style={styles.photoContainer}>
                  <Image source={{ uri: photoUrl }} style={styles.galleryPhoto} />
                  <TouchableOpacity 
                    style={styles.deletePhotoButton}
                    onPress={() => handleDeletePhoto(photoUrl)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noPhotosText}>No has subido fotos aún</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <TextInput
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            outlineColor="#ccc"
            activeOutlineColor="#ff9800"
          />
          
          <TextInput
            label="Número de teléfono"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            mode="outlined"
            outlineColor="#ccc"
            activeOutlineColor="#ff9800"
          />
          
          <TextInput
            label="Profesión"
            value={profession}
            onChangeText={setProfession}
            style={styles.input}
            mode="outlined"
            outlineColor="#ccc"
            activeOutlineColor="#007bff"
          />
          
          <TouchableOpacity style={styles.datePickerButton} onPress={handleShowDatePicker}>
            <Text style={styles.dateText}>Fecha de nacimiento: {birthDate.toLocaleDateString()}</Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={handleCancelDate}
            maximumDate={new Date()}
          />
          
          <TextInput
            label="Género"
            value={gender}
            onChangeText={setGender}
            style={styles.input}
            mode="outlined"
            outlineColor="#ccc"
            activeOutlineColor="#ff9800"
          />
          
          <TextInput
            label="Preferencia sexual"
            value={sexualPreference}
            onChangeText={setSexualPreference}
            style={styles.input}
            mode="outlined"
            outlineColor="#ccc"
            activeOutlineColor="#ff9800"
          />
          
          <TextInput
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            mode="outlined"
            outlineColor="#ccc"
            activeOutlineColor="#ff9800"
          />
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mis Hobbies</Text>
          
          <View style={styles.hobbiesContainer}>
            {predefinedHobbies.map((hobby) => (
              <TouchableOpacity
                key={hobby}
                style={[
                  styles.hobbyChip,
                  hobbies.includes(hobby) && styles.selectedHobby
                ]}
                onPress={() => handleToggleHobby(hobby)}
              >
                <Text 
                  style={[
                    styles.hobbyText,
                    hobbies.includes(hobby) && styles.selectedHobbyText
                  ]}
                >
                  {hobby}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.customHobbyContainer}>
            <TextInput
              label="Agregar hobby personalizado"
              value={customHobby}
              onChangeText={setCustomHobby}
              style={styles.customHobbyInput}
              mode="outlined"
              outlineColor="#ccc"
              activeOutlineColor="#ff9800"
              right={
                <TextInput.Icon 
                  icon="plus" 
                  onPress={handleAddCustomHobby}
                  disabled={!customHobby.trim()}
                />
              }
            />
          </View>
          
          {hobbies.length > 0 && (
            <View style={styles.selectedHobbiesContainer}>
              <Text style={styles.selectedHobbiesTitle}>Hobbies seleccionados:</Text>
              <View style={styles.selectedHobbiesList}>
                {hobbies.map((hobby) => (
                  <View key={hobby} style={styles.selectedHobbyChip}>
                    <Text style={styles.selectedHobbyChipText}>{hobby}</Text>
                    <TouchableOpacity onPress={() => handleToggleHobby(hobby)}>
                      <Ionicons name="close-circle" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={acceptMediaNaranja ? 'checked' : 'unchecked'}
              onPress={() => setAcceptMediaNaranja(!acceptMediaNaranja)}
              color="#ff9800"
            />
            <Text style={styles.checkboxLabel}>
              Participar en Media Naranja
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton, saving && styles.disabledButton]} 
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 120, 
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff9800',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHint: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#ff9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  photosLoading: {
    marginVertical: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryPhoto: {
    width: '100%',
    height: '100%',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotosText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 15,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
  },
  pickerSection: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  hobbyText: {
    marginRight: 5,
  },
  customHobbyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  customHobbyInput: {
    flex: 1,
    marginRight: 10,
  },
  addHobbyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addHobbyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
  },
  saveButtonText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  textArea: {
    height: 100,
  },
  selectedHobby: {
    backgroundColor: '#ff9800',
  },
  // Additional styles for hobbies that aren't in the main styles
  selectedHobbyText: {
    color: '#fff',
    fontWeight: '500',
  },
  selectedHobbiesContainer: {
    marginTop: 8,
  },
  selectedHobbiesTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  selectedHobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedHobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedHobbyChipText: {
    color: '#fff',
    marginRight: 6,
  },
  preferencesSection: {
    marginBottom: 24,
  },
});
