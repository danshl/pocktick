import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InitialLoader() {
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const expiresAtStr = await AsyncStorage.getItem('authTokenExpiresAt');

      if (token && expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        const now = Date.now();

        if (now < expiresAt) {
          router.replace('/load-screen'); // תוקף תקין? ממשיך פנימה
          return;
        } else {
          // תוקף פג – מוחקים את הטוקן
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('authTokenExpiresAt');
          await AsyncStorage.removeItem('userEmail');
        }
      }
    } catch (err) {
      console.warn('Error checking login status:', err);
    }
  };

  checkLoginStatus();

  const timer = setTimeout(() => {
    setTimeoutReached(true);
    router.replace('/login');
  }, 3500);

  return () => clearTimeout(timer);
}, []);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={require('../assets/videos/intro.mp4')}
        shouldPlay
        isLooping={false}
        isMuted
        resizeMode={ResizeMode.COVER}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={(err) => {
          console.warn('Video failed to load', err);
          setError(true);
          router.replace('/login');
        }}
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            router.replace('/login');
          }
        }}
      />

      {(loading && !timeoutReached) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#1D2B64" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Text style={styles.loadingText}>Video failed to load.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  video: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1D2B64',
  },
});