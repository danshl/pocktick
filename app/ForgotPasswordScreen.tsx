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
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email) return;

    setLoading(true);
    setErrorMessage('');
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
          'A reset code has been sent to your email.'
        );
        router.push({ pathname: '/VerifyCodeScreen', params: { email } });
      } else {
        setErrorMessage(
          'We couldn’t find an account with this email address. Please make sure it’s correct or try a different one.'
        );
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.subtitle}>
        Please enter your email to reset your password
      </Text>

      {/* Email label with icon */}
      <View style={styles.labelContainer}>
        <Image
          source={require('../assets/icons/mail.png')}
          style={styles.labelIcon}
        />
        <Text style={styles.label}>Email</Text>
      </View>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.resetButton,
          (!email || loading) && styles.disabledButton,
        ]}
        onPress={handleForgotPassword}
        disabled={!email || loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? 'Sending...' : 'Reset password'}
        </Text>
        <View style={styles.arrowCircle}>
          <Image
            source={require('../assets/icons/next_white.png')}
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Error text */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 30,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#1D2B64',
      left:10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#1D2B64',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
  },
  input: {
    height: 50,
    borderColor: '#E1E1E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 28,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
resetButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // ✅ הכל מיושר לאמצע
  backgroundColor: '#1D2B64',
  height: 56,
  paddingHorizontal: 20,
  borderRadius: 16,
  gap: 10, // מרווח בין הטקסט לחץ (רק אם תומך ב־React Native שלך)
},

  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  arrowCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    marginTop: 20,
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});
