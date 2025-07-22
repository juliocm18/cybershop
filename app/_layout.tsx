import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { View, StyleSheet, Image } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import './i18n/i18n';
import LanguageSelector from './components/LanguageSelector';
import { useTranslation } from "react-i18next";
import * as WebBrowser from 'expo-web-browser';


const videoSource = require('../assets/video/splash.mp4');
const splashImage = require('../assets/images/splash.png');

WebBrowser.maybeCompleteAuthSession();

function MainLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [showSplashImage, setShowSplashImage] = useState(true);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const { i18n } = useTranslation();

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false; // No queremos que el video se repita
    //player.play();
  });


  useEffect(() => {
    i18n.changeLanguage("es");
    const timeout = setTimeout(() => {
      setShowSplashImage(false);
      player?.play();
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);


  useEffect(() => {
    const checkPlaybackStatus = setInterval(() => {
      if (player?.duration && player?.currentTime) {
        if (player.currentTime >= player.duration - 0.1) {
          setIsVideoFinished(true);
          clearInterval(checkPlaybackStatus);
        }
      }
    }, 500);
    return () => clearInterval(checkPlaybackStatus);
  }, [player]);


  useEffect(() => {
    if (!loading && isVideoFinished) {
      router.replace("/locationhome");
    }
  }, [session, loading, isVideoFinished]);


  useEffect(() => {
    const checkPlaybackStatus = setInterval(() => {
      if (player?.duration && player?.currentTime) {
        if (player.currentTime >= player.duration - 0.1) {
          setIsVideoFinished(true);
          clearInterval(checkPlaybackStatus);
        }
      }
    }, 500);

    return () => clearInterval(checkPlaybackStatus);
  }, []);

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
  video: { width: "100%", height: "100%" },
  imageSplash: {
    width: "100%",
    height: "100%",
  },
});