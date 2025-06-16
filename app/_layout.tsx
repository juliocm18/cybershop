import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useVideoPlayer, VideoView } from "expo-video";
import * as WebBrowser from 'expo-web-browser';
import { Asset } from 'expo-asset';
import { View, Image, StyleSheet } from "react-native";

// 🔥 Usa Asset.fromModule en lugar de require directo
const splashVideoAsset = Asset.fromModule(require('../assets/video/splash.mp4'));
const splashImageAsset = Asset.fromModule(require('../assets/images/splash.png'));

WebBrowser.maybeCompleteAuthSession();

function MainLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [showSplashImage, setShowSplashImage] = useState(true);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
  });

  // Preload y obtén las URIs del video
  useEffect(() => {
    const loadAssets = async () => {
      await splashVideoAsset.downloadAsync();
      await splashImageAsset.downloadAsync();
      setVideoUri(splashVideoAsset.localUri || splashVideoAsset.uri);
    };

    loadAssets();
  }, []);

  // Reproduce después de 2.5s
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplashImage(false);
      player?.play();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [player]);

  // Escuchar fin del video
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

  // Navegar cuando termina el video
  useEffect(() => {
    if (!loading && isVideoFinished) {
      router.replace("/locationhome");
    }
  }, [session, loading, isVideoFinished]);

  return (
    <View style={styles.container}>
      {showSplashImage ? (
        <Image source={{ uri: splashImageAsset.uri }} style={styles.imageSplash} resizeMode="cover" />
      ) : !isVideoFinished && videoUri ? (
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
