import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentScreen() {
  const { url } = useLocalSearchParams();

  if (!url || typeof url !== 'string') {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/my-tickets')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <WebView
        source={{ uri: url }}
        startInLoadingState
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // ← רקע כללי לבן
    paddingTop: 60, // במקום top: 60
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    padding: 5,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff', // ← רקע פנימי של ה-WebView לבן
  },
});