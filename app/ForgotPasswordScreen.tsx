import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Check your email',
          'A reset code has been sent if this email exists.'
        );
        router.push({ pathname: '/VerifyCodeScreen', params: { email } });
      } else {
        Alert.alert('Error', data.message || 'Email not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backCircle}>
          <Image
            source={require('../assets/icons/back-arrow.png')}
            style={styles.backIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Title and subtitle */}
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.subtitle}>
        Please enter your email to reset the password
      </Text>

      {/* Email input field */}
      <Text style={styles.label}>Your Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Reset password button */}
      <TouchableOpacity
        style={[
          styles.resetButton,
          (!email || loading) && styles.disabledButton,
        ]}
        onPress={handleForgotPassword}
        disabled={!email || loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? 'Sending...' : 'Reset Password'}
        </Text>
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
  },
  backButton: {
    position: 'absolute',
    top: 90, // Adjusted according to status bar
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
    top: 100,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    top: 110,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    top: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 20,
    top: 120,
  },
  resetButton: {
    backgroundColor: '#1D2B64',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    top: 130,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(29, 43, 100, 0.4)',
  },
});
