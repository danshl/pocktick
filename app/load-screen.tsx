import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image as RNImage } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { fetchUnifiedTickets } from './ticketService';
import { useUserData } from './useUserData';
import type { Ticket } from './types';

export default function LoadScreen() {
  const router = useRouter();
  const { setTickets } = useUserData();
  const [isReady, setIsReady] = useState(false);
  const [videoDone, setVideoDone] = useState(false);
  const videoRef = useRef<Video>(null);

  // טוען מידע מראש
  useEffect(() => {
    const load = async () => {
      try {
        const tickets = await fetchUnifiedTickets();
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

  // fallback אחרי 4 שניות אם הסרטון לא מסיים
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isReady) {
        setVideoDone(true); // מתנהג כאילו הסרטון סיים
      }
    }, 4000);
    return () => clearTimeout(timeout);
  }, [isReady]);

  // מעבר אחרי ש-2 התנאים מתקיימים
  useEffect(() => {
    if (isReady && videoDone) {
      router.replace('/(tabs)/my-tickets');
    }
  }, [isReady, videoDone]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/videos/splash.mp4')}
        style={styles.video}
        isMuted
        shouldPlay
        resizeMode={ResizeMode.COVER}
        onError={(e) => {
          console.error('Video error:', e);
          setVideoDone(true); // fallback במידה והווידאו לא עובד
        }}
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
    backgroundColor: '#fff',
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
});