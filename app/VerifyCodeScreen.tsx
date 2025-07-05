import React, { useState, useRef, useEffect } from 'react';
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
import useTranslation from './i18n/useTranslation';

export default function VerifyCodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState<string[]>(['', '', '', '', '']);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(4);
  const [cooldown, setCooldown] = useState<number>(60);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/verify-reset-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: enteredCode }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setStatusMessage(t('resetSuccess'));
        setAttemptsLeft(4);
        router.push({
          pathname: '/SetNewPasswordScreen',
          params: { email, resetToken: result.resetToken },
        });
      } else {
        const isAttemptsMsg = result.message?.toLowerCase().includes('too many');
        if (isAttemptsMsg || attemptsLeft === 1) {
          setStatusMessage(t('tooManyAttempts'));
          setTimeout(() => router.replace('/login'), 2000);
        } else {
          setAttemptsLeft((prev) => prev - 1);
          setStatusMessage(t('incorrectCode'));
        }
      }
    } catch (error) {
      setStatusMessage(t('serverError'));
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      if (response.ok) {
        setCooldown(60);
        setStatusMessage(t('codeResent'));
      } else {
        setStatusMessage(t('resendFailed'));
      }
    } catch (error) {
      setStatusMessage(t('resendServerError'));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backButton}>
        <Image source={require('../assets/icons/arrow-left.png')} style={[styles.backIcon,I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }]} />
      </TouchableOpacity>

      <Text style={styles.title}>{t('verifyTitle')}</Text>
      <Text style={styles.subtitle}>
        {t('verifySubtitle')} <Text style={styles.email}>{email}</Text>{'\n'}
        {t('verifyInstruction')}
      </Text>

      <View style={[styles.codeContainer, I18nManager.isRTL && { flexDirection: 'row-reverse' }]}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            style={styles.codeInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleInputChange(index, value)}
            onKeyPress={({ nativeEvent }) => {
              if (
                nativeEvent.key === 'Backspace' &&
                code[index] === '' &&
                index > 0
              ) {
                inputsRef.current[index - 1]?.focus();
              }
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, isLoading && { opacity: 0.7 }]}
        onPress={handleVerifyCode}
        disabled={isLoading}
      >
        <Text style={styles.verifyButtonText}>
          {isLoading ? t('verifying') : t('verifyButton')}
        </Text>

        {!isLoading && (
          <View style={styles.arrowCircle}>
            <Image source={require('../assets/icons/next_white.png')} style={[styles.arrowIcon
              ,I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }
            ]} />
            
          </View>
        )}
      </TouchableOpacity>

      {statusMessage && (
        <Text
          style={[
            styles.statusMessage,
            statusMessage === t('incorrectCode') ? { color: '#FF3B30' } : {},
          ]}
        >
          {statusMessage}
        {attemptsLeft >= 0 && statusMessage === t('incorrectCode') ? (
          <Text>
            . {attemptsLeft} {t('attemptsLeft')}
          </Text>
        ) : null}
        </Text>
      )}

      <Text style={styles.resendText}>
        {cooldown === 0 ? (
          <>
            {t('noCode')}{' '}
            <Text style={styles.resendLink} onPress={handleResendCode}>
              {t('resendLink')}
            </Text>
          </>
        ) : (
          `${t('resendAvailableIn')} ${cooldown}s`
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 250,
    paddingTop: 0,
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 24,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#1D2B64',
    left: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#1D2B64',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  email: {
    color: '#1D2B64',
    fontFamily: 'Poppins-Bold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
    marginHorizontal: 5,
  },
  verifyButton: {
    backgroundColor: '#1D2B64',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
  },
  verifyButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  statusMessage: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  resendText: {
    marginTop: 20,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  resendLink: {
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
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
});