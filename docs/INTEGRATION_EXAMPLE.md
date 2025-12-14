# Ejemplo de Integración - Protección contra Crashes Nativos

## 🚀 Integración Rápida (5 minutos)

### Paso 1: Inicializar en App.tsx

Busca tu archivo principal (probablemente `app/_layout.tsx` o similar en Expo Router):

```typescript
import { useEffect } from 'react';
import { setupGlobalErrorHandlers, crashLogger } from '../utils/crashlytics';

export default function RootLayout() {
  useEffect(() => {
    // Configurar handlers globales de errores
    setupGlobalErrorHandlers();
    
    // Log de inicio de app
    crashLogger.setBreadcrumb('App initialized', 'Lifecycle');
  }, []);

  return (
    // Tu layout existente
  );
}
```

### Paso 2: Proteger Operaciones de Imagen

**Antes (código vulnerable):**
```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });
  
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};
```

**Después (código protegido):**
```typescript
import * as ImagePicker from 'expo-image-picker';
import { useMediaSafety } from '../hooks/useMediaSafety';
import { crashLogger } from '../utils/crashlytics';

const { safeImagePicker, isProcessing } = useMediaSafety();

const pickImage = async () => {
  try {
    const result = await safeImagePicker(async () => {
      return await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8, // Reducido para evitar problemas de memoria
      });
    });
    
    if (result && !result.canceled) {
      setImage(result.assets[0].uri);
      await crashLogger.setBreadcrumb('Image selected successfully', 'Media');
    }
  } catch (error) {
    console.error('Error picking image:', error);
    // Mostrar mensaje al usuario
    Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta de nuevo.');
  }
};

// En tu JSX, deshabilitar botón mientras procesa
<Button 
  onPress={pickImage} 
  disabled={isProcessing}
  title={isProcessing ? "Procesando..." : "Seleccionar Imagen"}
/>
```

### Paso 3: Proteger Manipulación de Imágenes

```typescript
import * as ImageManipulator from 'expo-image-manipulator';
import { useMediaSafety } from '../hooks/useMediaSafety';

const { safeImageManipulator } = useMediaSafety();

const resizeImage = async (uri: string) => {
  try {
    const result = await safeImageManipulator(async () => {
      return await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
    });
    
    if (result) {
      return result.uri;
    }
  } catch (error) {
    await crashLogger.logError(error as Error, 'ImageResize');
    throw error;
  }
};
```

### Paso 4: Proteger Operaciones de Video

```typescript
import { Video } from 'expo-av';
import { useMediaSafety } from '../hooks/useMediaSafety';

const { safeVideoOperation } = useMediaSafety();

const playVideo = async () => {
  try {
    await safeVideoOperation(async () => {
      await videoRef.current?.playAsync();
    });
  } catch (error) {
    console.error('Error playing video:', error);
    Alert.alert('Error', 'No se pudo reproducir el video.');
  }
};

// Cleanup al desmontar
useEffect(() => {
  return () => {
    videoRef.current?.unloadAsync().catch(console.error);
  };
}, []);
```

## 📝 Ejemplos Completos de Componentes

### Componente de Perfil con Foto

```typescript
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMediaSafety } from '../hooks/useMediaSafety';
import { crashLogger } from '../utils/crashlytics';

export default function ProfilePicture() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { safeImagePicker, safeImageManipulator, isProcessing } = useMediaSafety();

  const selectAndProcessImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
        return;
      }

      // Seleccionar imagen con protección
      const result = await safeImagePicker(async () => {
        return await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      });

      if (!result || result.canceled) {
        return;
      }

      const selectedUri = result.assets[0].uri;

      // Redimensionar imagen con protección
      const processedResult = await safeImageManipulator(async () => {
        const ImageManipulator = await import('expo-image-manipulator');
        return await ImageManipulator.manipulateAsync(
          selectedUri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
      });

      if (processedResult) {
        setImageUri(processedResult.uri);
        await crashLogger.setBreadcrumb('Profile picture updated', 'User');
        
        // Aquí subirías la imagen a tu backend
        // await uploadProfilePicture(processedResult.uri);
      }
    } catch (error) {
      await crashLogger.logError(error as Error, 'ProfilePictureUpdate');
      Alert.alert('Error', 'No se pudo procesar la imagen. Intenta de nuevo.');
    }
  };

  return (
    <View>
      <TouchableOpacity 
        onPress={selectAndProcessImage}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="large" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
        ) : (
          <View style={{ width: 200, height: 200, backgroundColor: '#ccc' }} />
        )}
      </TouchableOpacity>
    </View>
  );
}
```

### Componente de Galería de Productos

```typescript
import React, { useState } from 'react';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMediaSafety } from '../hooks/useMediaSafety';
import { crashLogger } from '../utils/crashlytics';

interface ProductImage {
  id: string;
  uri: string;
}

export default function ProductGallery() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const { safeImagePicker, isProcessing } = useMediaSafety();

  const addImage = async () => {
    try {
      const result = await safeImagePicker(async () => {
        return await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 0.7,
        });
      });

      if (result && !result.canceled) {
        const newImage: ProductImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        
        setImages(prev => [...prev, newImage]);
        await crashLogger.logCustomEvent('ProductImageAdded', { 
          imageCount: images.length + 1 
        });
      }
    } catch (error) {
      await crashLogger.logError(error as Error, 'ProductGalleryAdd');
    }
  };

  const removeImage = async (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    await crashLogger.setBreadcrumb('Product image removed', 'Media');
  };

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => removeImage(item.id)}>
            <Image source={{ uri: item.uri }} style={{ width: 100, height: 100 }} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity onPress={addImage} disabled={isProcessing}>
            {/* Botón para agregar imagen */}
          </TouchableOpacity>
        }
      />
    </View>
  );
}
```

### Componente de Video Player

```typescript
import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { useMediaSafety } from '../hooks/useMediaSafety';
import { crashLogger } from '../utils/crashlytics';

export default function VideoPlayer({ uri }: { uri: string }) {
  const videoRef = useRef<Video>(null);
  const { safeVideoOperation } = useMediaSafety();

  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.error) {
      await crashLogger.logNativeError(
        `Video playback error: ${status.error}`,
        undefined
      );
    }
  };

  const playVideo = async () => {
    try {
      await safeVideoOperation(async () => {
        await videoRef.current?.playAsync();
      });
    } catch (error) {
      await crashLogger.logError(error as Error, 'VideoPlayback');
    }
  };

  useEffect(() => {
    crashLogger.setBreadcrumb('Video player mounted', 'Media');
    
    return () => {
      // Cleanup crítico para evitar memory leaks
      videoRef.current?.unloadAsync().catch((error) => {
        crashLogger.logError(error, 'VideoUnload');
      });
      crashLogger.setBreadcrumb('Video player unmounted', 'Media');
    };
  }, []);

  return (
    <View>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={{ width: 300, height: 200 }}
        useNativeControls
        resizeMode="contain"
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}
```

## 🔍 Logging Estratégico

### Tracking de Usuario

```typescript
import { crashLogger } from '../utils/crashlytics';

// Cuando el usuario inicia sesión
const handleLogin = async (userId: string, email: string) => {
  await crashLogger.setUserContext(userId, {
    email,
    loginTime: new Date().toISOString(),
  });
};

// Cuando el usuario realiza acciones importantes
const handlePurchase = async (orderId: string) => {
  await crashLogger.logCustomEvent('PurchaseCompleted', {
    orderId,
    timestamp: new Date().toISOString(),
  });
};
```

### Breadcrumbs para Navegación

```typescript
import { useEffect } from 'react';
import { usePathname } from 'expo-router';
import { crashLogger } from '../utils/crashlytics';

export function useNavigationTracking() {
  const pathname = usePathname();

  useEffect(() => {
    crashLogger.setBreadcrumb(`Navigated to ${pathname}`, 'Navigation');
  }, [pathname]);
}

// Usar en _layout.tsx
export default function RootLayout() {
  useNavigationTracking();
  
  return (
    // Tu layout
  );
}
```

## 🧪 Testing

### Test Manual

1. **Build de debug con símbolos:**
   ```bash
   npx expo run:android --variant debug
   ```

2. **Probar operaciones de media:**
   - Seleccionar múltiples imágenes consecutivamente
   - Manipular imágenes grandes (> 5MB)
   - Reproducir videos largos
   - Cambiar rápidamente entre pantallas con media

3. **Verificar logs en Crashlytics:**
   - Ve a Firebase Console
   - Busca tus breadcrumbs y eventos custom
   - Verifica que los errores se registren correctamente

### Simular Crash (Solo para Testing)

```typescript
// NO USAR EN PRODUCCIÓN
import crashlytics from '@react-native-firebase/crashlytics';

const testCrash = async () => {
  if (__DEV__) {
    await crashlytics().log('Testing crash reporting');
    crashlytics().crash(); // Fuerza un crash para testing
  }
};
```

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Verificar que `utils/crashlytics.ts` existe
- [ ] Verificar que `hooks/useMediaSafety.ts` existe
- [ ] Llamar `setupGlobalErrorHandlers()` en App.tsx

### Protección de Media
- [ ] Reemplazar `ImagePicker` directo con `safeImagePicker`
- [ ] Reemplazar `ImageManipulator` directo con `safeImageManipulator`
- [ ] Reemplazar operaciones de video con `safeVideoOperation`
- [ ] Agregar cleanup en `useEffect` para videos/audio

### Logging
- [ ] Agregar `setUserContext` después del login
- [ ] Agregar breadcrumbs en navegación
- [ ] Agregar logging de eventos importantes
- [ ] Verificar logs en Firebase Console

### Testing
- [ ] Build de debug y probar operaciones de media
- [ ] Verificar símbolos en Crashlytics
- [ ] Probar en múltiples dispositivos
- [ ] Validar que crashes se reportan correctamente

## 🚨 Troubleshooting

### Los símbolos no aparecen en Crashlytics

```bash
# Verificar que el build tiene símbolos
cd android
./gradlew :app:assembleRelease

# Verificar archivos de símbolos
ls -la app/build/intermediates/merged_native_libs/release/out/lib/
```

### El logging no funciona

```typescript
// Verificar inicialización
import { crashLogger } from '../utils/crashlytics';

useEffect(() => {
  crashLogger.logCustomEvent('TestEvent', { test: 'value' })
    .then(() => console.log('Logging works!'))
    .catch(err => console.error('Logging failed:', err));
}, []);
```

### Crashes siguen ocurriendo

1. Revisa los logs de Crashlytics para el patrón exacto
2. Verifica que todas las operaciones de media usan los wrappers
3. Reduce la calidad de imágenes/videos
4. Agrega más logging alrededor del código problemático
5. Considera agregar delays entre operaciones pesadas

## 📚 Próximos Pasos

1. Implementar las protecciones en tus componentes existentes
2. Hacer un build de release y probar exhaustivamente
3. Monitorear Crashlytics durante 1-2 semanas
4. Ajustar timeouts y reintentos según necesidad
5. Considerar agregar más logging específico para tu app
