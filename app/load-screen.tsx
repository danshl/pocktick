import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image as RNImage } from 'react-native';
import { Video, ResizeMode} from 'expo-av';
import { useRouter } from 'expo-router';
import { fetchTickets } from './ticketService';
import { useUserData } from './useUserData';
import type { Ticket } from './types';

export default function LoadScreen() {
  const router = useRouter();
  const { setTickets } = useUserData();
  const [isReady, setIsReady] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const tickets = await fetchTickets();
        setTickets(tickets);

        await Promise.all(tickets.map((t: Ticket) => RNImage.prefetch(t.event.imageUrl)));

        setIsReady(true);
      } catch (err) {
        console.error('Error loading tickets:', err);
        router.replace('/login');
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (isReady && videoDone) {
      router.replace('/(tabs)/my-tickets');
    }
  }, [isReady, videoDone]);

  return (
    <View style={styles.container}>
<Video
  ref={videoRef}
  source={require('../assets/splash.mp4')}
  style={styles.video}
  isMuted
  shouldPlay
  resizeMode={ResizeMode.COVER}
  onPlaybackStatusUpdate={(status) => {
    if ('isLoaded' in status && status.isLoaded && status.didJustFinish && !status.isLooping) {
      setVideoDone(true);
    }
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // ← מסך לבן
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 100,
  },
  loadingText: {
    color: '#000', // ← טקסט שחור (כי הרקע לבן)
    marginTop: 12,
    fontSize: 16,
  },
});