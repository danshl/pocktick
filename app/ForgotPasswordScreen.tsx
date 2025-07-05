import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { requestPasswordReset } from './api/auth';
import CustomAlert from './CustomAlert';
import useTranslation from './i18n/useTranslation';
import { I18nManager } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  const handleForgotPassword = async () => {
    if (!email) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setAlertMessage(t('resetCodeSent'));
        setAlertVisible(true);
        router.push({ pathname: '/VerifyCodeScreen', params: { email } });
      } if (result.message?.toLowerCase().includes('user not found')) {
  setErrorMessage(t('userNotFound'));
} else {
  setErrorMessage(result.message || t('somethingWentWrong'));
}
    } catch (error) {
      setErrorMessage(t('somethingWentWrongTryLater'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backButton}>
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={[
            styles.backIcon,
            I18nManager.isRTL && { transform: [{ rotate: '180deg' }] },
          ]}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{t('forgotPassword')}</Text>
      <Text style={styles.subtitle}>{t('enterEmailToReset')}</Text>

      <View style={styles.labelContainer}>
        <Image source={require('../assets/icons/mail.png')} style={styles.labelIcon} />
        <Text style={styles.label}>{t('email')}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('emailPlaceholder')}
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        textAlign={I18nManager.isRTL ? 'right' : 'left'}
      />

      <TouchableOpacity
        style={[styles.resetButton, (!email || loading) && styles.disabledButton]}
        onPress={handleForgotPassword}
        disabled={!email || loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? t('sending') : t('resetPassword')}
        </Text>
        <View style={styles.arrowCircle}>
          <Image
            source={require('../assets/icons/next_white.png')}
            style={[
              styles.arrowIcon,
              I18nManager.isRTL && { transform: [{ rotate: '180deg' }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 20,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#1D2B64',
    left: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 6,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    marginTop:-2,
    tintColor: '#1D2B64',
  },
  label: {
    fontSize: 16,
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
    justifyContent: 'center',
    backgroundColor: '#1D2B64',
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 10,
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
