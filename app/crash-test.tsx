import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CrashTestButton from './components/CrashTestButton';
import BackButton from './components/BackButton';

/**
 * Pantalla de prueba para Crashlytics
 * ELIMINAR EN PRODUCCIÓN
 * 
 * Para acceder: navega a /crash-test
 */
export default function CrashTestScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton route="/" />
        <Text style={styles.headerTitle}>Crashlytics Test</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 Instrucciones</Text>
          <Text style={styles.infoText}>
            1. Asegúrate de haber hecho el prebuild:{'\n'}
            <Text style={styles.code}>npx expo prebuild --clean</Text>
          </Text>
          <Text style={styles.infoText}>
            2. Compila la app en modo development:{'\n'}
            <Text style={styles.code}>npx expo run:android</Text>
          </Text>
          <Text style={styles.infoText}>
            3. Usa los botones abajo para probar diferentes tipos de crashes
          </Text>
          <Text style={styles.infoText}>
            4. Los crashes aparecerán en Firebase Console en unos minutos
          </Text>
        </View>

        <CrashTestButton />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔍 Verificar en Firebase</Text>
          <Text style={styles.infoText}>
            1. Ve a Firebase Console{'\n'}
            2. Selecciona tu proyecto: mallcybershop-62a85{'\n'}
            3. Ve a Crashlytics en el menú lateral{'\n'}
            4. Los crashes pueden tardar 1-5 minutos en aparecer
          </Text>
        </View>

        <View style={[styles.infoBox, styles.warningBox]}>
          <Text style={styles.warningTitle}>⚠️ IMPORTANTE</Text>
          <Text style={styles.warningText}>
            • Crashlytics NO funciona con Expo Go{'\n'}
            • Necesitas un development build o production build{'\n'}
            • ELIMINA esta pantalla antes de publicar en producción
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    margin: 20,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ff9800',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f57c00',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#e65100',
    lineHeight: 22,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#263238',
    color: '#4CAF50',
    padding: 4,
    borderRadius: 4,
  },
});
