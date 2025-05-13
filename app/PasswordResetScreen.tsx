import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function PasswordResetScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backCircle}>
          <Image source={require('../assets/icons/back-arrow.png')} style={styles.backIcon} />
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Password reset</Text>
      <Text style={styles.subtitle}>
        Your password has been successfully reset. Click confirm to set a new password.
      </Text>

      {/* Approve button */}
      <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={() => router.push('/SetNewPasswordScreen')}
        >
        <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  backButton: {
    position: 'absolute',
    top: 90, 
    left: 20,
    zIndex: 10,
  },
  
  backCircle: {
    width: 40, 
    height: 40,
    borderRadius: 25, 
    backgroundColor: '#E0E0E0', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backIcon: {
    width: 25,
    height: 22,
    tintColor: '#000',
  },  

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 100,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  confirmButton: {
    backgroundColor: '#5787E2',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
