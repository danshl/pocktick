import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  I18nManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from './CustomAlert';
import useTranslation from './i18n/useTranslation';

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const { email, resetToken } = useLocalSearchParams();
  const { t } = useTranslation();

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
      showCustomAlert(t('passwordsDontMatch'));
      return;
    }

    if (password.length < 6) {
      showCustomAlert(t('passwordTooShort'));
      return;
    }

    try {
      console.log("00",resetToken);
      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetToken, newPassword: password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showCustomAlert(t('passwordUpdated'));
        setTimeout(() => {
          setAlertVisible(false);
          router.replace('/login');
        }, 1500);
      } else {
        showCustomAlert(data.message || t('updateFailed'));
      }
    } catch (error) {
      console.error('Error:', error);
      showCustomAlert(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('../assets/icons/arrow-left.png')} style={[styles.backIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]} />
      </TouchableOpacity>

      <Text style={styles.title}>{t('setNewPasswordTitle')}</Text>
      <Text style={styles.subtitle}>{t('setNewPasswordSubtitle')}</Text>

      <View style={styles.labelRow}>
        <Image source={require('../assets/icons/lock.png')} style={styles.labelIcon} />
        <Text style={styles.label}>{t('password')}</Text>
      </View>
      <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, I18nManager.isRTL && { textAlign: 'right' }]}
        placeholder={t('enterNewPassword')}
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
        <Text style={styles.label}>{t('confirmPassword')}</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, I18nManager.isRTL && { textAlign: 'right' }]}
          placeholder={t('reenterPassword')}
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
          {loading ? t('updating') : t('updatePassword')}
        </Text>
        {!loading && (
          <View style={styles.arrowCircle}>
            <Image
              source={require('../assets/icons/next_white.png')}
              style={[styles.arrowIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }]}
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
    paddingTop: 110,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 34,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#1D2B64',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'flex-start',
    color: '#1D2B64',
    marginBottom: 0,
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
    gap: 6,
  },
  labelIcon: {
    width: 16,
    height: 16,
    tintColor: '#1D2B64',
  },
});