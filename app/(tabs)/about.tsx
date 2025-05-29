import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      style={{ backgroundColor: '#fff' }} 
      contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
      
      <Text style={styles.title}>About Us</Text>

      <Text style={styles.paragraph}>
        Welcome to <Text style={styles.bold}>PockTick</Text> – your one-stop solution for storing and managing all your event tickets in one place.
      </Text>

      <Text style={styles.paragraph}>
        More and more companies are starting to use our secure interface to issue tickets directly to this app, giving you a smoother, more convenient ticketing experience. No more lost emails or scattered screenshots – everything is stored, updated, and verified within your personal wallet.
      </Text>

      <Text style={styles.paragraph}>
        Our platform enables safe and trustworthy ticket transfers between users. Each time a ticket is transferred, the QR code is regenerated, making it impossible to sell the same ticket to multiple people. This ensures a fair and secure experience for everyone.
      </Text>

      <Text style={styles.paragraph}>
        To further protect against scalping and inflated prices, all ticket transfers are done at <Text style={styles.bold}>110%</Text> of the original price – keeping things transparent and ethical for buyers and sellers alike.
      </Text>

      <Text style={styles.paragraph}>
        Ticket Exchange is more than just an app – it’s a smarter, safer way to enjoy your favorite events.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.bold}>This is the first secure app that manages all your tickets in one place and enables fraud-free resale.</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 25,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1D2B64',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#1D2B64',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
