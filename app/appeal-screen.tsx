import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppealScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeal Ticket</Text>
      </View>

      <View style={styles.content}>
        <Image source={require('../assets/images/name.png')} style={styles.image} />
        <Text style={styles.description}>
          This screen is intended for appealing issues related to external tickets.
          {'\n\n'}
          The system is currently under development.
          Please contact us by email with a description of the issue you experienced,
          and our team will get back to you as soon as possible.
        </Text>
        <Text selectable style={styles.email}>appeals@pocktick.com</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1D2B64',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: -20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
  },
});