import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const { url } = useLocalSearchParams();

  if (!url || typeof url !== 'string') {
    return null;
  }

  return (
    <View style={{ flex: 1 , top: 60}}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <WebView source={{ uri: url }} startInLoadingState />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 10,
    backgroundColor: '#ffffffcc',
    borderRadius: 20,
    padding: 5,
  },
});