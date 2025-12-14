import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import './i18n/i18n';
import LanguageSelector from './components/LanguageSelector';
import { useTranslation } from "react-i18next";
import * as WebBrowser from 'expo-web-browser';
import { initializeCrashlytics } from './config/firebase';
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandlers, crashLogger } from '../utils/crashlytics';

// Initialize Crashlytics
initializeCrashlytics();
setupGlobalErrorHandlers();

const videoSource = require('../assets/video/splash.mp4');

WebBrowser.maybeCompleteAuthSession();

function MainLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const { i18n } = useTranslation();

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false; 
    //player.play();
  });


  useEffect(() => {
    i18n.changeLanguage("es");
    player?.play();
    crashLogger.setBreadcrumb('Splash video started', 'Media');
  }, []);


  useEffect(() => {
    const checkPlaybackStatus = setInterval(() => {
      if (player?.duration && player?.currentTime) {
        if (player.currentTime >= player.duration - 0.1) {
          setIsVideoFinished(true);
          clearInterval(checkPlaybackStatus);
          crashLogger.setBreadcrumb('Splash video finished', 'Media');
        }
      }
    }, 500);
    return () => {
      clearInterval(checkPlaybackStatus);
      crashLogger.setBreadcrumb('Video playback cleanup', 'Media');
    };
  }, [player]);


  useEffect(() => {
    if (isVideoFinished && !loading) {
      // Navigate to home after video finishes
      router.replace("/");
    }
  }, [isVideoFinished, loading]);


  return (
    <View style={styles.container}>
      {!isVideoFinished ? (
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
        />
      ) : null}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function Layout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  video: { width: "100%", height: "100%" },
});