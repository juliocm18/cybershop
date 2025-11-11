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
    const [countryCode, setCountryCode] = useState("+1");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [birthDate, setBirthDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [name, setName] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isCountryModalVisible, setCountryModalVisible] = useState(false);

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
        setCountryCode("+1");
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

    // Country codes data - alphabetically sorted
    const countryCodes = [
        // América del Norte
        { code: "+1", country: "Estados Unidos/Canadá", flag: "🇺🇸" },
        { code: "+52", country: "México", flag: "🇲🇽" },
        
        // América Central y Caribe
        { code: "+501", country: "Belice", flag: "🇧🇿" },
        { code: "+502", country: "Guatemala", flag: "🇬🇹" },
        { code: "+503", country: "El Salvador", flag: "🇸🇻" },
        { code: "+504", country: "Honduras", flag: "🇭🇳" },
        { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
        { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
        { code: "+507", country: "Panamá", flag: "🇵🇦" },
        { code: "+53", country: "Cuba", flag: "🇨🇺" },
        { code: "+1-809", country: "República Dominicana", flag: "🇩🇴" },
        { code: "+1-787", country: "Puerto Rico", flag: "🇵🇷" },
        { code: "+1-876", country: "Jamaica", flag: "🇯🇲" },
        { code: "+509", country: "Haití", flag: "🇭🇹" },
        
        // América del Sur
        { code: "+54", country: "Argentina", flag: "🇦🇷" },
        { code: "+55", country: "Brasil", flag: "🇧🇷" },
        { code: "+56", country: "Chile", flag: "🇨🇱" },
        { code: "+57", country: "Colombia", flag: "🇨🇴" },
        { code: "+58", country: "Venezuela", flag: "🇻🇪" },
        { code: "+591", country: "Bolivia", flag: "🇧🇴" },
        { code: "+592", country: "Guyana", flag: "🇬🇾" },
        { code: "+593", country: "Ecuador", flag: "🇪🇨" },
        { code: "+594", country: "Guayana Francesa", flag: "🇬🇫" },
        { code: "+595", country: "Paraguay", flag: "🇵🇾" },
        { code: "+597", country: "Surinam", flag: "🇸🇷" },
        { code: "+598", country: "Uruguay", flag: "🇺🇾" },
        { code: "+51", country: "Perú", flag: "🇵🇪" },
        
        // Europa Occidental
        { code: "+34", country: "España", flag: "🇪🇸" },
        { code: "+33", country: "Francia", flag: "🇫🇷" },
        { code: "+39", country: "Italia", flag: "🇮🇹" },
        { code: "+351", country: "Portugal", flag: "🇵🇹" },
        { code: "+49", country: "Alemania", flag: "🇩🇪" },
        { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
        { code: "+353", country: "Irlanda", flag: "🇮🇪" },
        { code: "+32", country: "Bélgica", flag: "🇧🇪" },
        { code: "+31", country: "Países Bajos", flag: "🇳🇱" },
        { code: "+352", country: "Luxemburgo", flag: "🇱🇺" },
        { code: "+41", country: "Suiza", flag: "🇨🇭" },
        { code: "+43", country: "Austria", flag: "🇦🇹" },
        
        // Europa del Norte
        { code: "+45", country: "Dinamarca", flag: "🇩🇰" },
        { code: "+46", country: "Suecia", flag: "🇸🇪" },
        { code: "+47", country: "Noruega", flag: "🇳🇴" },
        { code: "+358", country: "Finlandia", flag: "🇫🇮" },
        { code: "+354", country: "Islandia", flag: "🇮🇸" },
        
        // Europa del Este
        { code: "+48", country: "Polonia", flag: "�🇱" },
        { code: "+420", country: "República Checa", flag: "🇨🇿" },
        { code: "+421", country: "Eslovaquia", flag: "🇸🇰" },
        { code: "+36", country: "Hungría", flag: "🇭🇺" },
        { code: "+40", country: "Rumania", flag: "🇷🇴" },
        { code: "+359", country: "Bulgaria", flag: "🇧�🇬" },
        { code: "+7", country: "Rusia", flag: "�🇺" },
        { code: "+380", country: "Ucrania", flag: "🇺🇦" },
        { code: "+375", country: "Bielorrusia", flag: "�🇧🇾" },
        
        // Europa del Sur
        { code: "+30", country: "Grecia", flag: "🇬🇷" },
        { code: "+385", country: "Croacia", flag: "🇭🇷" },
        { code: "+386", country: "Eslovenia", flag: "🇸🇮" },
        { code: "+381", country: "Serbia", flag: "🇷🇸" },
        { code: "+382", country: "Montenegro", flag: "🇲🇪" },
        { code: "+389", country: "Macedonia del Norte", flag: "🇲🇰" },
        { code: "+355", country: "Albania", flag: "🇦🇱" },
        
        // Asia Oriental
        { code: "+86", country: "China", flag: "🇨🇳" },
        { code: "+81", country: "Japón", flag: "🇯🇵" },
        { code: "+82", country: "Corea del Sur", flag: "🇰🇷" },
        { code: "+850", country: "Corea del Norte", flag: "🇰🇵" },
        { code: "+886", country: "Taiwán", flag: "🇹🇼" },
        { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
        { code: "+853", country: "Macao", flag: "🇲🇴" },
        { code: "+976", country: "Mongolia", flag: "🇲🇳" },
        
        // Sudeste Asiático
        { code: "+66", country: "Tailandia", flag: "🇹🇭" },
        { code: "+84", country: "Vietnam", flag: "🇻🇳" },
        { code: "+60", country: "Malasia", flag: "🇲🇾" },
        { code: "+65", country: "Singapur", flag: "🇸🇬" },
        { code: "+62", country: "Indonesia", flag: "🇮🇩" },
        { code: "+63", country: "Filipinas", flag: "🇵🇭" },
        { code: "+95", country: "Myanmar", flag: "🇲🇲" },
        { code: "+856", country: "Laos", flag: "🇱🇦" },
        { code: "+855", country: "Camboya", flag: "🇰🇭" },
        { code: "+673", country: "Brunéi", flag: "🇧🇳" },
        
        // Asia del Sur
        { code: "+91", country: "India", flag: "�🇳" },
        { code: "+92", country: "Pakistán", flag: "🇵🇰" },
        { code: "+880", country: "Bangladés", flag: "🇧🇩" },
        { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
        { code: "+977", country: "Nepal", flag: "🇳🇵" },
        { code: "+975", country: "Bután", flag: "🇧🇹" },
        { code: "+960", country: "Maldivas", flag: "🇲🇻" },
        { code: "+93", country: "Afganistán", flag: "🇦�🇫" },
        
        // Medio Oriente
        { code: "+98", country: "Irán", flag: "🇮🇷" },
        { code: "+964", country: "Irak", flag: "🇮🇶" },
        { code: "+966", country: "Arabia Saudita", flag: "🇸🇦" },
        { code: "+971", country: "Emiratos Árabes Unidos", flag: "🇦🇪" },
        { code: "+965", country: "Kuwait", flag: "🇰🇼" },
        { code: "+974", country: "Catar", flag: "🇶🇦" },
        { code: "+973", country: "Baréin", flag: "🇧🇭" },
        { code: "+968", country: "Omán", flag: "🇴🇲" },
        { code: "+967", country: "Yemen", flag: "�🇪" },
        { code: "+962", country: "Jordania", flag: "🇯🇴" },
        { code: "+961", country: "Líbano", flag: "🇱🇧" },
        { code: "+963", country: "Siria", flag: "🇸🇾" },
        { code: "+972", country: "Israel", flag: "🇮🇱" },
        { code: "+970", country: "Palestina", flag: "🇵🇸" },
        { code: "+90", country: "Turquía", flag: "🇹🇷" },
        
        // África del Norte
        { code: "+20", country: "Egipto", flag: "🇪🇬" },
        { code: "+212", country: "Marruecos", flag: "🇲🇦" },
        { code: "+213", country: "Argelia", flag: "🇩🇿" },
        { code: "+216", country: "Túnez", flag: "🇹🇳" },
        { code: "+218", country: "Libia", flag: "🇱🇾" },
        { code: "+249", country: "Sudán", flag: "🇸🇩" },
        
        // África Occidental
        { code: "+234", country: "Nigeria", flag: "🇳🇬" },
        { code: "+233", country: "Ghana", flag: "�🇭" },
        { code: "+225", country: "Costa de Marfil", flag: "🇨�🇮" },
        { code: "+221", country: "Senegal", flag: "🇸�" },
        { code: "+223", country: "Malí", flag: "🇲🇱" },
        { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
        { code: "+227", country: "Níger", flag: "🇳🇪" },
        { code: "+228", country: "Togo", flag: "🇹🇬" },
        { code: "+229", country: "Benín", flag: "🇧🇯" },
        
        // África Oriental
        { code: "+254", country: "Kenia", flag: "🇰🇪" },
        { code: "+255", country: "Tanzania", flag: "�🇹🇿" },
        { code: "+256", country: "Uganda", flag: "🇺🇬" },
        { code: "+250", country: "Ruanda", flag: "🇷🇼" },
        { code: "+251", country: "Etiopía", flag: "🇪🇹" },
        { code: "+252", country: "Somalia", flag: "🇸🇴" },
        
        // África del Sur
        { code: "+27", country: "Sudáfrica", flag: "🇿🇦" },
        { code: "+264", country: "Namibia", flag: "🇳🇦" },
        { code: "+267", country: "Botsuana", flag: "🇧🇼" },
        { code: "+268", country: "Esuatini", flag: "🇸🇿" },
        { code: "+260", country: "Zambia", flag: "🇿🇲" },
        { code: "+263", country: "Zimbabue", flag: "🇿🇼" },
        { code: "+258", country: "Mozambique", flag: "🇲🇿" },
        
        // Oceanía
        { code: "+61", country: "Australia", flag: "🇦🇺" },
        { code: "+64", country: "Nueva Zelanda", flag: "🇳🇿" },
        { code: "+679", country: "Fiyi", flag: "�🇯" },
        { code: "+675", country: "Papúa Nueva Guinea", flag: "�🇵�" },
    ].sort((a, b) => a.country.localeCompare(b.country, 'es'));

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

        // Phone number format validation (7-15 digits without country code)
        const phoneRegex = /^[0-9]{7,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setValidationError("El número de teléfono debe tener entre 7 y 15 dígitos");
            return;
        }

        // Combine country code with phone number for storage
        const fullPhoneNumber = countryCode + phoneNumber;

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
            const phoneExists = await checkPhoneExists(fullPhoneNumber);
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
                    phone_number: fullPhoneNumber,
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
                            <View style={styles.phoneContainer}>
                                <View style={styles.countryCodeWrapper}>
                                    <TouchableOpacity
                                        style={styles.countryCodeSelector}
                                        onPress={() => setCountryModalVisible(true)}
                                    >
                                        <Text style={styles.countryCodeText}>{countryCode}</Text>
                                        <Ionicons name="chevron-down" size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: 10 }} />
                                <View style={styles.phoneInputWrapper}>
                                    <TextInput
                                        style={[styles.input, styles.phoneInput]}
                                        label="Teléfono"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        mode="outlined"
                                        keyboardType="phone-pad"
                                        outlineColor="#ddd"
                                        activeOutlineColor="#fb8436"
                                        theme={{ colors: { primary: '#fb8436' } }}
                                        maxLength={15}
                                        placeholder="Número sin código"
                                    />
                                </View>
                            </View>

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

            {/* Modal de Selección de País */}
            <Modal
                visible={isCountryModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCountryModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecciona el Código de País</Text>
                            <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScrollView}>
                            {countryCodes.map((item) => (
                                <TouchableOpacity
                                    key={item.code}
                                    style={styles.countryOption}
                                    onPress={() => {
                                        setCountryCode(item.code);
                                        setCountryModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.countryOptionCode}>{item.code}</Text>
                                    <Text style={styles.countryOptionName}>{item.country}</Text>
                                    {countryCode === item.code && (
                                        <Ionicons name="checkmark" size={24} color="#fb8436" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 30,
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
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    countryCodeWrapper: {
        width: 110,
    },
    countryCodeLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    countryCodeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 56,
        paddingHorizontal: 12,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    phoneInputWrapper: {
        flex: 1,
    },
    phoneInput: {
        marginBottom: 0,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalScrollView: {
        maxHeight: 500,
    },
    countryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    countryOptionCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fb8436',
        width: 70,
    },
    countryOptionName: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
});