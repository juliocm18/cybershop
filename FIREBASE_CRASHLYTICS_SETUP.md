# Configuración de Firebase Crashlytics

## ✅ Implementación Completada

Firebase Crashlytics ha sido implementado en la aplicación MallCyberShop. A continuación se detallan los pasos necesarios para completar la configuración.

## 📋 Archivos Creados/Modificados

### Archivos Nuevos:
- `app/config/firebase.ts` - Configuración y funciones de Crashlytics
- `app/components/ErrorBoundary.tsx` - Componente para capturar errores de React

### Archivos Modificados:
- `app.config.json` - Plugins de Firebase agregados
- `app/_layout.tsx` - Inicialización de Crashlytics y ErrorBoundary
- `app/context/AuthContext.tsx` - Integración con rastreo de usuarios

## 🔧 Pasos de Configuración Requeridos

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Agrega una aplicación Android y/o iOS al proyecto

### 2. Configurar Android

1. En Firebase Console, ve a Project Settings > Your apps > Android
2. Descarga el archivo `google-services.json`
3. Coloca el archivo en: `android/app/google-services.json`
4. El archivo debe tener esta estructura de carpetas:
   ```
   android/
   └── app/
       └── google-services.json
   ```

### 3. Configurar iOS (si aplica)

1. En Firebase Console, ve a Project Settings > Your apps > iOS
2. Descarga el archivo `GoogleService-Info.plist`
3. Coloca el archivo en: `ios/MallCyberShop/GoogleService-Info.plist`

### 4. Rebuild de la Aplicación

Después de agregar los archivos de configuración, debes hacer un rebuild completo:

#### Para Android:
```bash
# Limpiar el proyecto
npx expo prebuild --clean

# O si prefieres usar EAS Build
eas build --platform android --profile development
```

#### Para iOS:
```bash
# Limpiar el proyecto
npx expo prebuild --clean

# O si prefieres usar EAS Build
eas build --platform ios --profile development
```

### 5. Habilitar Crashlytics en Firebase Console

1. Ve a Firebase Console > Crashlytics
2. Habilita Crashlytics para tu proyecto
3. Espera a que se complete la configuración inicial

## 🧪 Probar la Implementación

### Opción 1: Usar la función de prueba (Solo para desarrollo)

En cualquier componente, puedes importar y usar:

```typescript
import { testCrash } from './config/firebase';

// Esto forzará un crash para probar
testCrash();
```

**⚠️ IMPORTANTE:** Elimina esta llamada después de probar, nunca la dejes en producción.

### Opción 2: Generar un error real

Crea un error intencional en tu código:

```typescript
const causarError = () => {
  throw new Error('Error de prueba para Crashlytics');
};
```

### Verificar en Firebase Console

1. Los crashes pueden tardar unos minutos en aparecer
2. Ve a Firebase Console > Crashlytics
3. Deberías ver los reportes de crashes

## 📊 Características Implementadas

### 1. Rastreo Automático de Errores
- Todos los errores no capturados se envían automáticamente a Crashlytics
- El ErrorBoundary captura errores de React

### 2. Información de Usuario
- El ID del usuario se registra automáticamente al iniciar sesión
- El email del usuario se guarda como atributo
- Se limpia la información al cerrar sesión

### 3. Contexto de Errores
- Cada error incluye el contexto donde ocurrió (signIn, signUp, etc.)
- Se registran atributos personalizados para mejor debugging

### 4. Funciones Disponibles

```typescript
// Registrar un error manualmente
import { logError } from './config/firebase';
logError(new Error('Mi error'), 'contexto');

// Establecer ID de usuario
import { setCrashlyticsUserId } from './config/firebase';
setCrashlyticsUserId('user123');

// Establecer atributos personalizados
import { setCrashlyticsAttribute } from './config/firebase';
setCrashlyticsAttribute('pantalla', 'home');

// Registrar mensajes personalizados
import { logCrashlyticsMessage } from './config/firebase';
logCrashlyticsMessage('Usuario completó el checkout');
```

## 🔍 Debugging

### Si los crashes no aparecen:

1. **Verifica los archivos de configuración:**
   - `google-services.json` debe estar en `android/app/`
   - `GoogleService-Info.plist` debe estar en `ios/[AppName]/`

2. **Revisa los logs:**
   ```bash
   # Android
   npx react-native log-android
   
   # iOS
   npx react-native log-ios
   ```

3. **Asegúrate de que la app no esté en modo debug:**
   - Crashlytics solo funciona en builds de release o development
   - No funciona con Expo Go

4. **Verifica la consola:**
   - Deberías ver: "Firebase Crashlytics initialized successfully"

## 📱 Builds de Producción

Para builds de producción con EAS:

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

## 🚨 Notas Importantes

1. **Crashlytics NO funciona con Expo Go** - Necesitas hacer un development build o production build
2. Los crashes pueden tardar hasta 5 minutos en aparecer en la consola
3. En desarrollo, los crashes se reportan inmediatamente
4. Asegúrate de tener los archivos `google-services.json` y/o `GoogleService-Info.plist` antes de hacer el build

## 📚 Recursos Adicionales

- [Documentación oficial de Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)
- [React Native Firebase - Crashlytics](https://rnfirebase.io/crashlytics/usage)
- [Expo - Using Firebase](https://docs.expo.dev/guides/using-firebase/)

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Firebase Console
- [ ] Aplicación Android/iOS agregada al proyecto
- [ ] `google-services.json` descargado y colocado en `android/app/`
- [ ] `GoogleService-Info.plist` descargado y colocado en `ios/[AppName]/` (si aplica)
- [ ] Rebuild completo de la aplicación realizado
- [ ] Crashlytics habilitado en Firebase Console
- [ ] Crash de prueba realizado y verificado en Firebase Console

---

**Última actualización:** Diciembre 2024
