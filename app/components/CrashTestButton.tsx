import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { testCrash, logError, logCrashlyticsMessage } from '../config/firebase';

/**
 * Componente de prueba para Crashlytics
 * SOLO USAR EN DESARROLLO - ELIMINAR EN PRODUCCIÓN
 */
export default function CrashTestButton() {
  // Opción 1: Crash nativo de Firebase (recomendado para probar)
  const handleNativeCrash = () => {
    Alert.alert(
      'Crash Test',
      '¿Estás seguro? Esto cerrará la app inmediatamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, crashear',
          style: 'destructive',
          onPress: () => {
            logCrashlyticsMessage('Usuario activó crash de prueba');
            testCrash();
          },
        },
      ]
    );
  };

  // Opción 2: Error de JavaScript
  const handleJSError = () => {
    Alert.alert(
      'JS Error Test',
      'Esto generará un error de JavaScript que será capturado por ErrorBoundary',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar Error',
          style: 'destructive',
          onPress: () => {
            throw new Error('Error de prueba para Crashlytics - JavaScript');
          },
        },
      ]
    );
  };

  // Opción 3: Error registrado manualmente
  const handleLogError = () => {
    const testError = new Error('Error registrado manualmente para prueba');
    logError(testError, 'CrashTestButton.handleLogError');
    Alert.alert('Error Registrado', 'El error fue enviado a Crashlytics sin crashear la app');
  };

  // Opción 4: Error asíncrono
  const handleAsyncError = async () => {
    try {
      // Simular una operación que falla
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Error asíncrono de prueba'));
        }, 1000);
      });
    } catch (error: any) {
      logError(error, 'CrashTestButton.handleAsyncError');
      Alert.alert('Error Asíncrono', 'Error capturado y enviado a Crashlytics');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Crashlytics Test Panel</Text>
      <Text style={styles.warning}>⚠️ SOLO PARA DESARROLLO</Text>

      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleNativeCrash}>
        <Text style={styles.buttonText}>💥 Crash Nativo (Cierra la app)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleJSError}>
        <Text style={styles.buttonText}>⚡ Error JavaScript</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={handleLogError}>
        <Text style={styles.buttonText}>📝 Registrar Error (Sin crash)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={handleAsyncError}>
        <Text style={styles.buttonText}>⏱️ Error Asíncrono</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#ff6b6b',
  },
  infoButton: {
    backgroundColor: '#4dabf7',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
