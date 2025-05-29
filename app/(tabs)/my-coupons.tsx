// app/my-coupons.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyCouponsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Here are your coupons</Text>
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
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D2B64',
  },
});
