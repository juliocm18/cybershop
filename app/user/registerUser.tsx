import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image, Alert, Platform, Linking, ScrollView, KeyboardAvoidingView, SafeAreaView, Modal } from "react-native";

import { TextInput, Checkbox } from "react-native-paper";
import { Picker } from '@react-native-picker/picker';
import { globalStyles } from "../styles";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { pickImage, uploadImage } from "../company/functions";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from "../context/AuthContext";
import UserFunctions from "./functions";
import { supabase } from "../supabase";
import Select from "../components/select";
import gendersData from "../data/genders.json";
import sexualPreferencesData from "../data/sexual-preferences.json";
import { useRouter } from "expo-router";
import BackButton from '../components/BackButton';

export default function RegisterUser() {
    const router = useRouter();
    // ...existing state
    const [deseaMediaNaranja, setDeseaMediaNaranja] = useState(false);
    const [genders, setGenders] = useState(gendersData);
    const [sexualPreferences, setSexualPreferences] = useState(sexualPreferencesData);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [birthDate, setBirthDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [name, setName] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    // Nuevos estados para los campos obligatorios
    const [gender, setGender] = useState("");
    const [sexualPreference, setSexualPreference] = useState("");
    const [profession, setProfession] = useState("");
    const [description, setDescription] = useState("");

    // Opcionales
    const [zodiacSign, setZodiacSign] = useState("");
    const predefinedHobbies = ["Deportes", "Lectura", "Viajar", "Música", "Cine", "Tecnología", "Arte", "Cocina"];
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [customHobby, setCustomHobby] = useState("");

    // Función para calcular el signo zodiacal
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

    // Actualizar signo zodiacal cuando cambia la fecha de nacimiento
    React.useEffect(() => {
        setZodiacSign(getZodiacSign(birthDate));
    }, [birthDate]);

    const clearFields = () => {
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setLogoUri(null);
        setLoading(false);
        setValidationError(null);
        setDeseaMediaNaranja(false);
    };

    const handlePickImage = async () => {

        const uri = await pickImage(); // 
        if (uri) {
            setLogoUri(uri); // 
        }
    };

    // Validate if email already exists in the database
    const checkEmailExists = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;
            return data !== null;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    // Validate if phone number already exists in the database
    const checkPhoneExists = async (phone: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('phone_number', phone)
                .maybeSingle();

            if (error) throw error;
            return data !== null;
        } catch (error) {
            console.error('Error checking phone:', error);
            return false;
        }
    };

    const navigateToHome = () => {

        router.push('/main-menu');
        
    };

    const handleSaveUser = async () => {
        // Reset validation error
        setValidationError(null);

        // Basic field validation
        if (!email || !password || !phoneNumber || !logoUri || !birthDate || !termsAccepted || !name) {
            Alert.alert("Error", "Debe completar todos los campos y aceptar los términos y condiciones");
            return;
        }

        // Phone number format validation (simple check for now)
        const phoneRegex = /^[0-9]{9}$/; // Assumes 10-digit phone number
        if (!phoneRegex.test(phoneNumber)) {
            setValidationError("El número de teléfono debe tener 9 dígitos");
            return;
        }

        // Validar que el usuario tenga al menos 18 años
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            Alert.alert("Error", "Debes tener al menos 18 años para registrarte");
            return;
        }

        setLoading(true);
        try {

           

            // Check if email already exists
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                setValidationError("Este correo electrónico ya está registrado");
                setLoading(false);
                return;
            }

            // Check if phone number already exists
            const phoneExists = await checkPhoneExists(phoneNumber);
            if (phoneExists) {
                setValidationError("Este número de teléfono ya está registrado");
                setLoading(false);
                return;
            }

            const uploadedUrl = await uploadImage(logoUri);
            if (uploadedUrl) {
                console.log(" Imagen subida con éxito:", uploadedUrl);
            } else {
                return;
            }

            // Register user using context's signUp (which wraps supabase.auth.signUp)
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setValidationError(error.message || "Ocurrió un error al registrar el usuario");
                setLoading(false);
                return;
            }
            // If registration is successful, create user profile
            const userId = data?.user?.id;
            if (userId) {
                await supabase
                    .from("user_role")
                    .insert({ user_id: userId, role_id: 5 });
                const newProfile = {
                    id: userId,
                    avatar_url: uploadedUrl,
                    name: name,
                    birth_date: birthDate.toISOString().split('T')[0],
                    phone_number: phoneNumber,
                    email: email,
                    gender: gender,
                    sexual_preference: sexualPreference,
                    profession: profession,
                    description: description,
                    zodiac_sign: zodiacSign,
                    hobbies: hobbies,
                    accept_media_naranja: deseaMediaNaranja,
                };
                await UserFunctions.saveClientProfile(newProfile);
                Alert.alert("Aviso", "Registro creado con éxito");
                // Unsubscribe from all Supabase channels to prevent duplicate subscriptions
                const allChannels = supabase.getChannels();
                allChannels.forEach(channel => {
                    supabase.removeChannel(channel);
                });
                clearFields();
            } else {
                setValidationError("No se pudo obtener el usuario registrado. Por favor, intente iniciar sesión.");
            }
        } catch (error: any) {
            console.error("Error al crear el usuario:", error);
            Alert.alert("Error", "Ocurrió un error al crear el usuario");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDate = (date: Date) => {
        setBirthDate(date);
        setDatePickerVisibility(false);
    };

    const handleCancelDate = () => {
        setDatePickerVisibility(false);
    };

    const openTerms = async () => {
        const url = 'https://mallcybershop.com/terms'; // Reemplaza con la URL real de tus términos
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", "No se puede abrir el enlace");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <View style={styles.backButtonContainer}>
                                <BackButton route="/main-menu" />
                            </View>
                            <Text style={styles.pageTitleHeader}>Registro de Usuario</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.inputLabel}>Nombre Completo</Text>
                            <TextInput
                                style={styles.input}
                                label="Nombre"
                                value={name}
                                onChangeText={setName}
                                mode="outlined"
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                            />

                            <Text style={styles.inputLabel}>Correo Electrónico</Text>
                            <TextInput
                                style={styles.input}
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                            />

                            <Text style={styles.inputLabel}>Número de Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                label="Teléfono"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                mode="outlined"
                                keyboardType="phone-pad"
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                                maxLength={10}
                            />

                            <Text style={styles.inputLabel}>Contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese su contraseña"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                mode="outlined"
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? "eye-outline" : "eye-off-outline"}
                                        onPress={() => setShowPassword(!showPassword)}
                                        color="#666"
                                    />
                                }
                            />

                            <Text style={styles.inputLabel}>Foto de Perfil</Text>
                            <TouchableOpacity
                                style={styles.imagePicker}
                                onPress={handlePickImage}
                            >
                                <Ionicons name="camera-outline" size={24} color="#fff" style={styles.cameraIcon} />
                                <Text style={styles.imagePickerText}>Seleccione su foto de perfil</Text>
                            </TouchableOpacity>

                            {logoUri && (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: logoUri }} style={styles.logoPreview} />
                                </View>
                            )}

                            {/* Género */}
                            <Text style={styles.inputLabel}>Género</Text>

                            <Select
                                label="Género"
                                selectedValue={gender}
                                onValueChange={setGender}
                                items={genders}
                            />


                            {/* Preferencia Sexual */}
                            <Text style={styles.inputLabel}>Preferencia Sexual</Text>
                            <Select
                                label="Preferencia Sexual"
                                selectedValue={sexualPreference}
                                onValueChange={setSexualPreference}
                                items={sexualPreferences}
                            />

                            {/* Profesión */}
                            <Text style={styles.inputLabel}>Profesión</Text>
                            <TextInput
                                style={styles.input}
                                label="Profesión"
                                value={profession}
                                onChangeText={setProfession}
                                mode="outlined"
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                            />

                            {/* Descripción */}
                            <Text style={styles.inputLabel}>Descripción</Text>
                            <TextInput
                                style={styles.input}
                                label="Cuéntanos sobre ti"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                            />

                            <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center', height: 50 }]}
                                onPress={() => setDatePickerVisibility(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#333' }}>
                                    {birthDate ? birthDate.toLocaleDateString('es-ES') : 'Selecciona tu fecha de nacimiento'}
                                </Text>
                            </TouchableOpacity>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                date={birthDate}
                                minimumDate={new Date(1920, 0, 1)}
                                maximumDate={new Date()}
                                onConfirm={handleConfirmDate}
                                onCancel={handleCancelDate}
                                locale="es-ES"
                                cancelTextIOS="Cancelar"
                                confirmTextIOS="Listo"
                            />

                            {/* Signo Zodiacal */}
                            <Text style={styles.inputLabel}>Signo Zodiacal</Text>
                            <TextInput
                                style={styles.input}
                                label="Signo Zodiacal"
                                value={zodiacSign}
                                mode="outlined"
                                editable={false}
                                outlineColor="#ddd"
                                activeOutlineColor="#fb8436"
                                theme={{ colors: { primary: '#fb8436' } }}
                            />

                            {/* Hobbies */}
                            <Text style={styles.inputLabel}>Hobbies</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                                {predefinedHobbies.map((hobby) => (
                                    <TouchableOpacity
                                        key={hobby}
                                        style={{
                                            backgroundColor: hobbies.includes(hobby) ? '#fb8436' : '#f0f0f0',
                                            padding: 8,
                                            borderRadius: 16,
                                            margin: 4,
                                        }}
                                        onPress={() => {
                                            if (hobbies.includes(hobby)) {
                                                setHobbies(hobbies.filter((h) => h !== hobby));
                                            } else {
                                                setHobbies([...hobbies, hobby]);
                                            }
                                        }}
                                    >
                                        <Text style={{ color: hobbies.includes(hobby) ? '#fff' : '#333' }}>{hobby}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    label="Agregar hobby"
                                    value={customHobby}
                                    onChangeText={setCustomHobby}
                                    mode="outlined"
                                    outlineColor="#ddd"
                                    activeOutlineColor="#fb8436"
                                    theme={{ colors: { primary: '#fb8436' } }}
                                />
                                <TouchableOpacity
                                    style={{ marginLeft: 8, backgroundColor: '#fb8436', padding: 10, borderRadius: 8 }}
                                    onPress={() => {
                                        if (customHobby.trim() && !hobbies.includes(customHobby.trim())) {
                                            setHobbies([...hobbies, customHobby.trim()]);
                                            setCustomHobby("");
                                        }
                                    }}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            {hobbies.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                                    {hobbies.map((hobby) => (
                                        <View key={hobby} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 16, padding: 6, margin: 4 }}>
                                            <Text style={{ color: '#333', marginRight: 4 }}>{hobby}</Text>
                                            <TouchableOpacity onPress={() => setHobbies(hobbies.filter((h) => h !== hobby))}>
                                                <Ionicons name="close-circle" size={18} color="#fb8436" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={styles.termsContainer}>
                                <Checkbox.Android
                                    status={termsAccepted ? 'checked' : 'unchecked'}
                                    onPress={() => setTermsAccepted(!termsAccepted)}
                                    color="#fb8436"
                                />
                                <View style={styles.termsTextContainer}>
                                    <Text style={styles.termsText}>Acepto los </Text>
                                    <TouchableOpacity onPress={openTerms}>
                                        <Text style={styles.termsLink}>términos y condiciones</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* ¿Desea formar parte de media naranja? */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <Checkbox.Android
                                    status={deseaMediaNaranja ? 'checked' : 'unchecked'}
                                    onPress={() => setDeseaMediaNaranja(!deseaMediaNaranja)}
                                    color="#fb8436"
                                />
                                <Text style={{ marginLeft: 8, fontSize: 16 }}>
                                    ¿Desea formar parte de media naranja?
                                </Text>
                            </View>

                            {validationError && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{validationError}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.registerButton, !termsAccepted && styles.buttonDisabled]}
                                onPress={handleSaveUser}
                                disabled={!termsAccepted}
                            >
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <Text style={styles.buttonText}>Guardando...</Text>
                                    </View>
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>Registrarse</Text>
                                    </View>
                                )}
                            </TouchableOpacity>



                            <TouchableOpacity
                                style={[styles.registerButton]}
                                onPress={navigateToHome}
                            >
                                
                                <View style={styles.buttonContent}>
                                    <Ionicons name="home-outline" size={20} color="#fff" style={styles.buttonIcon} />
                                    <Text style={styles.buttonText}>Ir al Menú de Apps</Text>
                                </View>
                               
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: '#ffebee',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#f44336',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 35,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 5,
        zIndex: 10, // Ensure header is above other elements
        elevation: 10, // Android elevation
    },
    backButtonContainer: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // Higher z-index to ensure it's on top
    },
    formContainer: {
        width: '100%',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
        color: "#fb8436",
    },
    pageTitleHeader: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fb8436",
        flex: 1,
        textAlign: 'center',
        marginLeft: -40, // Offset to center the title accounting for back button
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: "#555",
        fontWeight: "500",
    },
    input: {
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    imagePicker: {
        backgroundColor: "#fb8436",
        padding: 15,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cameraIcon: {
        marginRight: 10,
    },
    imagePickerText: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 16,
    },
    imagePreviewContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    logoPreview: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#fb8436",
    },
    datePickerButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    dateIcon: {
        marginRight: 10,
    },
    datePickerButtonText: {
        color: '#333',
        fontSize: 16,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10,
    },
    termsTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    },
    termsText: {
        fontSize: 15,
        color: '#333',
    },
    termsLink: {
        fontSize: 15,
        color: '#fb8436',
        textDecorationLine: 'underline',
    },
    registerButton: {
        backgroundColor: "#fb8436",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: '#333',
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
});