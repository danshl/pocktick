import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changePassword } from './api/auth';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);

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
      if (!token) throw new Error('Missing token');
      await changePassword(currentPassword, newPassword, token);
      Alert.alert('Success', 'Password changed successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('../assets/icons/arrow-left.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Change Password</Text>

      <LabelledInput
        label="Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={secureCurrent}
        toggleSecure={() => setSecureCurrent(!secureCurrent)}
      />

      <LabelledInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={secureNew}
        toggleSecure={() => setSecureNew(!secureNew)}
      />

      <LabelledInput
        label="Repeat New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={secureNew}
        toggleSecure={() => setSecureNew(!secureNew)}
      />

      <View style={styles.rowBetween}>
        <View style={styles.rowStart}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#ccc', true: '#1D2B64' }}
            thumbColor="#fff"
          />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/ForgotPasswordScreen')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handlePasswordChange}>
        <View style={styles.arrowSpacer} />
        <Text style={styles.confirmText}>Confirm</Text>
        <View style={styles.arrowCircle}>
          <Image
            source={require('../assets/icons/next_white.png')}
            style={styles.arrowIconImage}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

type LabelledInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  toggleSecure: () => void;
};

function LabelledInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  toggleSecure,
}: LabelledInputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={styles.labelRow}>
        <Image source={require('../assets/icons/lock.png')} style={styles.iconLabel} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
        />
        <TouchableOpacity onPress={toggleSecure}>
          <Image
            source={
              secureTextEntry
                ? require('../assets/icons/eye-off.png')
                : require('../assets/icons/eye.png')
            }
            style={styles.iconEye}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1D2B64',
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  arrowSpacer: {
    width: 40,
    height: 40,
  },
  arrowCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIconImage: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  backArrow: {
    fontSize: 28,
    color: '#1D2B64',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1D2B64',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    fontSize: 18,
    color: '#1D2B64',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 10,
    color: '#1D2B64',
    fontWeight: '500',
  },
  forgotText: {
    color: '#1D2B64',
    textDecorationLine: 'underline',
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 16,
  },
  iconLabel: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
  },
  iconEye: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  backButton: {
    marginBottom: 20,
    left: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#1D2B64',
  },
  inputLabel: {
    color: '#1D2B64',
    fontWeight: 'normal',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginTop: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
});