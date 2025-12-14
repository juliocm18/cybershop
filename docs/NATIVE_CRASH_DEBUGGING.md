# Guía de Debugging para Crashes Nativos (SIGABRT)

## 📋 Resumen del Problema

Los crashes SIGABRT desde `libc.so` con dirección `0x0000000000000000` indican que el programa llamó explícitamente a `abort()` debido a un error irrecuperable. En React Native con Expo, esto generalmente proviene de:

- **Código nativo de terceros** (bibliotecas con componentes C/C++)
- **Corrupción de memoria** (heap corruption, double-free, use-after-free)
- **Errores JNI** (manejo incorrecto de referencias Java-Native)
- **Problemas de sincronización de hilos** en código nativo

## 🔍 Bibliotecas Nativas en tu Proyecto

Tu aplicación usa las siguientes bibliotecas con componentes nativos:

### Alto Riesgo (Procesamiento Multimedia)
- `expo-av` - Audio/Video playback
- `expo-video` - Video processing
- `expo-image-picker` - Captura de imágenes
- `expo-image-manipulator` - Manipulación de imágenes
- `expo-media-library` - Acceso a galería

### Medio Riesgo
- `@react-native-firebase/crashlytics` - Crash reporting
- `react-native-reanimated` - Animaciones nativas
- `Hermes Engine` - Motor JavaScript

### Bajo Riesgo
- `expo-location` - Servicios de ubicación
- `expo-document-picker` - Selector de archivos
- `@react-native-async-storage/async-storage` - Almacenamiento

## 🛠️ Soluciones Implementadas

### 1. Configuración de Gradle Mejorada

**Archivo: `android/gradle.properties`**
```properties
# Símbolos de debug nativos para mejores crash reports
android.enableNativeCrashSymbolication=true

# Optimización R8 completa para detectar problemas
android.enableR8.fullMode=true
```

**Archivo: `android/app/build.gradle`**
- ✅ Símbolos de debug completos (`debugSymbolLevel 'FULL'`)
- ✅ Upload automático de símbolos nativos a Crashlytics
- ✅ Configuración para builds debug y release

### 2. Sistema de Logging Mejorado

**Archivo: `utils/crashlytics.ts`**

Utilidades implementadas:
- `CrashlyticsLogger` - Singleton para logging centralizado
- `logNativeError()` - Logging específico para errores nativos
- `logMediaOperation()` - Tracking de operaciones multimedia
- `logMemoryWarning()` - Monitoreo de memoria
- `setupGlobalErrorHandlers()` - Intercepta errores globales

**Uso básico:**
```typescript
import { crashLogger, setupGlobalErrorHandlers } from './utils/crashlytics';

// En tu App.tsx o index.js
setupGlobalErrorHandlers();

// Para logging manual
await crashLogger.logError(error, 'ComponentName');
await crashLogger.logNativeError('Error message', stackTrace);
```

### 3. Hooks de Seguridad para Media

**Archivo: `hooks/useMediaSafety.ts`**

Protección para operaciones multimedia:
- ⏱️ Timeouts configurables
- 🔄 Reintentos automáticos
- 📊 Logging detallado
- 🛡️ Manejo de errores robusto

**Ejemplo de uso:**
```typescript
import { useMediaSafety } from '../hooks/useMediaSafety';

function MyComponent() {
  const { safeImagePicker, isProcessing } = useMediaSafety();

  const pickImage = async () => {
    try {
      const result = await safeImagePicker(async () => {
        return await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      });
      
      if (result) {
        // Procesar imagen
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <Button 
      onPress={pickImage} 
      disabled={isProcessing}
      title="Seleccionar Imagen"
    />
  );
}
```

## 📱 Cómo Obtener Información del Crash

### Opción 1: Firebase Crashlytics Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Navega a **Crashlytics** en el menú lateral
4. Busca crashes con tipo **SIGABRT**
5. Revisa:
   - **Stack trace nativo** (simbolizado automáticamente)
   - **Custom logs** (de nuestro CrashlyticsLogger)
   - **Attributes** (platform, version, última operación)
   - **Breadcrumbs** (eventos antes del crash)

### Opción 2: Logcat en Tiempo Real

```bash
# Conecta tu dispositivo Android y ejecuta:
adb logcat -v time | grep -E "DEBUG|FATAL|CRASH|mallcybershop"

# Para ver solo crashes nativos:
adb logcat -v time | grep -E "SIGABRT|libc.so|tombstone"

# Guardar logs a archivo:
adb logcat -v time > crash_logs.txt
```

### Opción 3: Tombstone Files

Los tombstones contienen el stack trace completo del crash nativo:

```bash
# Listar tombstones en el dispositivo
adb shell ls -la /data/tombstones/

# Extraer el tombstone más reciente
adb pull /data/tombstones/tombstone_00 ./

# Ver contenido
cat tombstone_00
```

## 🔧 Debugging Paso a Paso

### Paso 1: Reproducir el Crash

1. Habilita logging detallado en tu app:
```typescript
// En App.tsx
import { setupGlobalErrorHandlers } from './utils/crashlytics';

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);
  
  // ... resto del código
}
```

2. Ejecuta la app en modo debug:
```bash
npm run android
```

3. Reproduce el escenario que causa el crash

### Paso 2: Analizar Logs de Crashlytics

Busca en los logs custom de Crashlytics:
- `[MEDIA]` - Operaciones multimedia antes del crash
- `[NATIVE ERROR]` - Errores nativos detectados
- `[MEMORY WARNING]` - Advertencias de memoria baja
- Breadcrumbs de navegación y estado de la app

### Paso 3: Identificar el Patrón

Preguntas clave:
- ¿El crash ocurre durante operaciones multimedia? (imagen, video, audio)
- ¿Sucede después de múltiples operaciones?
- ¿Está relacionado con memoria baja?
- ¿Ocurre en dispositivos específicos?
- ¿Hay un patrón de tiempo? (después de X minutos)

### Paso 4: Aplicar Soluciones Específicas

#### Si el crash es por operaciones de imagen:

```typescript
import { useMediaSafety } from '../hooks/useMediaSafety';

const { safeImagePicker, safeImageManipulator } = useMediaSafety();

// Usar wrappers seguros
const result = await safeImagePicker(() => 
  ImagePicker.launchImageLibraryAsync(options)
);

const manipulated = await safeImageManipulator(() =>
  ImageManipulator.manipulateAsync(uri, actions)
);
```

#### Si el crash es por memoria:

```typescript
import { useMemoryMonitor } from '../hooks/useMediaSafety';

const { memoryWarningCount } = useMemoryMonitor();

useEffect(() => {
  if (memoryWarningCount > 3) {
    // Liberar recursos, limpiar caché, etc.
    clearImageCache();
  }
}, [memoryWarningCount]);
```

#### Si el crash es por video:

```typescript
const { safeVideoOperation } = useMediaSafety();

const playVideo = await safeVideoOperation(async () => {
  // Operación de video con timeout de 90s
  return await videoRef.current?.playAsync();
});
```

## 🧪 Testing y Validación

### Build de Debug con Símbolos

```bash
# Limpiar build anterior
cd android && ./gradlew clean && cd ..

# Build con símbolos completos
npx expo run:android --variant debug
```

### Build de Release para Testing

```bash
# Build de release con símbolos
cd android
./gradlew assembleRelease

# Instalar APK
adb install app/build/outputs/apk/release/app-release.apk
```

### Verificar Símbolos en Crashlytics

Después de un crash en release:
1. Ve a Firebase Crashlytics
2. Verifica que el stack trace muestre nombres de funciones (no solo direcciones)
3. Si ves solo direcciones hexadecimales, los símbolos no se subieron correctamente

## 🚨 Prevención de Crashes

### Mejores Prácticas

1. **Siempre usar wrappers seguros para media:**
   ```typescript
   // ❌ MAL
   const result = await ImagePicker.launchImageLibraryAsync();
   
   // ✅ BIEN
   const result = await safeImagePicker(() => 
     ImagePicker.launchImageLibraryAsync()
   );
   ```

2. **Manejar errores explícitamente:**
   ```typescript
   try {
     await operation();
   } catch (error) {
     await crashLogger.logError(error, 'OperationName');
     // Mostrar mensaje al usuario
   }
   ```

3. **Limitar calidad de imágenes:**
   ```typescript
   ImagePicker.launchImageLibraryAsync({
     quality: 0.7, // Reducir para evitar problemas de memoria
     allowsEditing: true,
     aspect: [4, 3],
   });
   ```

4. **Liberar recursos después de uso:**
   ```typescript
   useEffect(() => {
     return () => {
       // Cleanup
       videoRef.current?.unloadAsync();
       audioRef.current?.unloadAsync();
     };
   }, []);
   ```

## 📊 Monitoreo Continuo

### Métricas Clave en Crashlytics

- **Crash-free users %** - Debe ser > 99%
- **Crashes por versión** - Identificar regresiones
- **Dispositivos afectados** - Problemas específicos de hardware
- **Versiones de Android** - Incompatibilidades de OS

### Alertas Recomendadas

Configura alertas en Firebase para:
- Aumento súbito de crashes (> 5% en 1 hora)
- Nuevos tipos de crashes
- Crashes en versión de producción

## 🔗 Recursos Adicionales

- [React Native Firebase Crashlytics](https://rnfirebase.io/crashlytics/usage)
- [Android NDK Debugging](https://developer.android.com/ndk/guides/debug)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Memory Management in React Native](https://reactnative.dev/docs/performance)

## 📝 Checklist de Implementación

- [x] Configuración de Gradle con símbolos nativos
- [x] CrashlyticsLogger implementado
- [x] Hooks de seguridad para media
- [x] Global error handlers configurados
- [ ] setupGlobalErrorHandlers() llamado en App.tsx
- [ ] Reemplazar operaciones de media con wrappers seguros
- [ ] Testing en dispositivos reales
- [ ] Validar símbolos en Crashlytics
- [ ] Configurar alertas en Firebase

## 🆘 Soporte

Si el crash persiste después de implementar estas soluciones:

1. Exporta los logs completos de Crashlytics
2. Incluye el tombstone file si está disponible
3. Documenta los pasos exactos para reproducir
4. Nota el modelo de dispositivo y versión de Android
5. Verifica si hay issues abiertos en las bibliotecas afectadas
