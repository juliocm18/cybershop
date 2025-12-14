# Compatibilidad con Expo Go

## Problema Resuelto

El error `Native module RNFBAppModule not found` ocurre porque `@react-native-firebase` requiere módulos nativos que no están disponibles en Expo Go (Metro bundler con `expo start`).

## Solución Implementada

Se modificó `utils/crashlytics.ts` para funcionar en **modo fallback** cuando los módulos nativos no están disponibles:

### Modo Fallback (Expo Go)
- ✅ Todos los logs se imprimen en la consola
- ✅ La app funciona normalmente
- ✅ No se envía información a Firebase Crashlytics
- ✅ Útil para desarrollo y debugging

### Modo Nativo (Build Nativo)
- ✅ Logs se envían a Firebase Crashlytics
- ✅ Stack traces simbolizados
- ✅ Breadcrumbs y atributos personalizados
- ✅ Monitoreo completo de crashes

## Cómo Funciona

```typescript
// Intenta cargar el módulo nativo
let crashlytics: any = null;
let isCrashlyticsAvailable = false;

try {
  crashlytics = require('@react-native-firebase/crashlytics').default;
  isCrashlyticsAvailable = true;
} catch (e) {
  // Fallback: módulo no disponible
  console.warn('[Crashlytics] Running in fallback mode');
  isCrashlyticsAvailable = false;
}
```

Todos los métodos verifican `isCrashlyticsAvailable` antes de usar Firebase:

```typescript
async logError(error: Error, context?: string) {
  // Siempre log a consola
  console.error(`[Crashlytics] Error: ${error.message}`, error);

  // Solo usa Firebase si está disponible
  if (!this.isEnabled || !isCrashlyticsAvailable) return;
  
  await crashlytics().recordError(error);
}
```

## Modos de Ejecución

### 1. Desarrollo con Expo Go
```bash
npx expo start
```
- ✅ Funciona inmediatamente
- ✅ Logs en consola
- ❌ Sin Firebase Crashlytics

### 2. Build de Desarrollo Nativo
```bash
npx expo run:android --variant debug
```
- ✅ Funciona con módulos nativos
- ✅ Logs en consola Y Firebase
- ✅ Crashlytics completo

### 3. Build de Producción
```bash
cd android
./gradlew assembleRelease
```
- ✅ Crashlytics completo
- ✅ Símbolos nativos subidos
- ✅ Monitoreo en producción

## Logs en Consola

Cuando ejecutas con `expo start`, verás:

```
[Crashlytics] Native module not available - running in fallback mode
[Crashlytics] Running in fallback mode (Expo Go or missing native module)
[Crashlytics] Breadcrumb: [Media] Splash video started
[Crashlytics] Media operation: ImagePicker { timestamp: '...' }
```

## Testing

### Probar en Expo Go (Desarrollo)
```bash
# Limpiar caché
npx expo start --clear

# La app debe iniciar sin errores
# Verás logs en consola pero sin Firebase
```

### Probar con Build Nativo (Pre-Producción)
```bash
# Build nativo
npx expo run:android

# Verás logs en consola Y en Firebase Crashlytics
```

## Ventajas de Esta Solución

1. **Desarrollo Rápido**: Usa Expo Go sin problemas
2. **Producción Completa**: Firebase Crashlytics funciona en builds nativos
3. **Sin Código Duplicado**: Mismo código para ambos modos
4. **Debugging Fácil**: Logs siempre visibles en consola
5. **Graceful Degradation**: No rompe la app si Firebase falla

## Importante

- ✅ **Expo Go**: Perfecto para desarrollo rápido
- ✅ **Build Nativo**: Necesario para testing de Crashlytics
- ✅ **Producción**: Siempre usar build nativo (release)

## Próximos Pasos

1. **Desarrollo**: Usa `expo start` normalmente
2. **Testing de Crashlytics**: Usa `expo run:android` para probar Firebase
3. **Producción**: Build release con símbolos nativos

La protección contra crashes funciona en **ambos modos**, solo cambia dónde se registran los logs.
