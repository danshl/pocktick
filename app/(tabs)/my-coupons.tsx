// app/my-coupons.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function MyCouponsScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/coming-soon.png')}
        style={styles.image}
        resizeMode="contain"
      />
    <Text style={styles.subtitle}>
      The Coupons feature is not available yet.{' '}
      <Text style={styles.highlight}>Stay tuned for updates!</Text>
    </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1D2B64',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
    highlight: {
    fontSize: 16,
    color: '#1b2b68',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
});