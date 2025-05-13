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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Sending password change request');

      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully!');
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backCircle}>
          <Image
            source={{
              uri: 'https://tickectexchange.blob.core.windows.net/ui-assets/back-arrow.png',
            }}
            style={styles.backIcon}
          />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Change Password</Text>

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Text style={styles.label}>Repeat New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.confirmButton} onPress={handlePasswordChange}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 80,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  confirmButton: {
    backgroundColor: '#1D2B64',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
