import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';

export default function InitialLoader() {
  const videoRef = useRef<Video>(null);
  const router = useRouter();

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
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            router.replace('/login');
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
  },
  video: {
    position: 'absolute',  
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});