import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useVideoPlayer, VideoView } from "expo-video";
import * as WebBrowser from 'expo-web-browser';
import { View, Image, StyleSheet } from "react-native";
import './i18n/i18n';
import { useTranslation } from "react-i18next";

const videoSource = require('../assets/video/splash.mp4');
const splashImage = require('../assets/images/splash.png');

WebBrowser.maybeCompleteAuthSession();

function MainLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const { i18n } = useTranslation();

  const [showSplashImage, setShowSplashImage] = useState(true);
  const [isVideoFinished, setIsVideoFinished] = useState(false);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
  });

  // Mostrar imagen y luego reproducir video
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplashImage(false);
      player?.play();
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Detectar fin del video
  useEffect(() => {
    const interval = setInterval(() => {
      if (player?.duration && player?.currentTime) {
        if (player.currentTime >= player.duration - 0.1) {
          setIsVideoFinished(true);
          clearInterval(interval);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  // Redirigir al final
  useEffect(() => {
    i18n.changeLanguage("es");
    if (!loading && isVideoFinished) {
      router.replace("/locationhome");
    }
  }, [session, loading, isVideoFinished]);

  return (
    <View style={styles.container}>
      {showSplashImage ? (
        <Image source={splashImage} style={styles.imageSplash} resizeMode="cover" />
      ) : !isVideoFinished ? (
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
        />
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </View>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  imageSplash: {
    width: "100%",
    height: "100%",
  },
});
