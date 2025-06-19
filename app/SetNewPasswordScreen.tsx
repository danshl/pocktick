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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from './CustomAlert';

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const { email, resetToken } = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

const handleUpdatePassword = async () => {
  if (password !== confirmPassword) {
    showCustomAlert('Passwords do not match!');
    return;
  }

  if (password.length < 6) {
    showCustomAlert('Password must be at least 6 characters.');
    return;
  }

  try {
    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/reset-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: resetToken, newPassword: password }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      showCustomAlert('Your password has been updated successfully.');
      setTimeout(() => {
        setAlertVisible(false);
        router.replace('/login');
      }, 1500);
    } else {
      showCustomAlert(data.message || 'Failed to update password.');
    }
  } catch (error) {
    console.error('Error:', error);
    showCustomAlert('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View>
          <Image source={require('../assets/icons/arrow-left.png')} style={styles.backIcon} />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Set a new password</Text>

      <Text style={styles.subtitle}>
        Create a new password. Ensure it differs from previous ones for security.
      </Text>

      <View style={styles.labelRow}>
        <Image source={require('../assets/icons/lock.png')} style={styles.labelIcon} />
        <Text style={styles.label}>Password</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your new password"
          secureTextEntry={!showPasswords}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
          <Image
            source={
              showPasswords
                ? require('../assets/icons/eye.png')
                : require('../assets/icons/eye-off.png')
            }
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.labelRow}>
        <Image source={require('../assets/icons/lock.png')} style={styles.labelIcon} />
        <Text style={styles.label}>Confirm Password</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          secureTextEntry={!showPasswords}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
          <Image
            source={
              showPasswords
                ? require('../assets/icons/eye.png')
                : require('../assets/icons/eye-off.png')
            }
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.updateButton,
          (!password || !confirmPassword || loading) && styles.disabledButton,
        ]}
        onPress={handleUpdatePassword}
        disabled={!password || !confirmPassword || loading}
      >
        <Text style={styles.updateButtonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
        {!loading && (
          <View style={styles.arrowCircle}>
            <Image
              source={require('../assets/icons/next_white.png')}
              style={styles.arrowIcon}
            />
          </View>
        )}
      </TouchableOpacity>
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
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
    top: 60,
    left: 20,
  },
  backIcon: {
    width: 25,
    height: 22,
    tintColor: '#000',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#1D2B64',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'flex-start',
    color: '#1D2B64',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  eyeIcon: {
    width: 22,
    height: 22,
  },
  updateButton: {
    backgroundColor: '#1D2B64',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  updateButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  arrowCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  arrowIcon: {
    width: 14,
    height: 14,
  },
  disabledButton: {
    backgroundColor: '#8085A3',
  },
  labelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  marginBottom: 5,
  gap: 6, // רווח בין האייקון לטקסט
},
labelIcon: {
  width: 16,
  height: 16,
  tintColor: '#1D2B64',
},
});
