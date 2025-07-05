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

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState<string[]>(['', '', '', '', '']);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorColor, setErrorColor] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [cooldownError, setCooldownError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const inputsRef = useRef<Array<TextInput | null>>([]);
const [isSending, setIsSending] = useState(false);
const [attemptsLeft, setAttemptsLeft] = useState(3);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } else {
      setCooldownError(null);
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

const handleSendCode = async () => {
  if (cooldown > 0 || isSending) return;

  setIsSending(true); // התחלת שליחה
  try {
    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/send-email-code',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();
    if (response.ok) {
      setCodeSent(true);
      setCooldown(60);
      setCooldownError(null);
      setSendError(null);
    } else {
      setSendError(result.message || t('serverError'));
    }
  } catch {
    setSendError(t('serverError'));
  } finally {
    setIsSending(false); // סיום שליחה
  }
};

const handleVerifyCode = async () => {
  const enteredCode = code.join('');

  try {
    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/verify-email-code',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredCode }),
      }
    );

    const result = await response.json();
    if (response.ok) {
      setStatusMessage(t('emailVerified'));
      setErrorColor('#28A745');
      setTimeout(() => router.replace('/login'), 2000);
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining <= 0) {
        setStatusMessage(t('tooManyAttempts'));
        setErrorColor('#D32F2F');
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        const msg =
          remaining === 1
            ? t('incorrectCodeLastAttempt')
            : `${t('incorrectCode')} (${remaining} ${t('attemptsLeft')})`;
        setStatusMessage(msg);
        setErrorColor('#D32F2F');
      }
    }
  } catch {
    setStatusMessage(t('serverError'));
    setErrorColor('#D32F2F');
  }
};

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
         <Image source={require('../assets/icons/arrow-left.png')} style={[styles.backIcon,I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }]} />
      </TouchableOpacity>

      <Text style={styles.title}>{t('verifyEmailTitle')}</Text>
      <Text style={styles.subtitle}>
        {!codeSent ? (
          <>
            {t('verifyEmailPrompt')}
            {'\n'}
            <Text style={styles.email}>{email}</Text>
            {'\n'}
            {t('sendMessage')}
          </>
        ) : (
          <>
            {t('codeSentTo')}
            {'\n'}
            <Text style={styles.email}>{email}</Text>
            {'\n'}
            {t('verifyWithin')}
          </>
        )}
      </Text>

      {!codeSent ? (
        <>
<TouchableOpacity
  style={[styles.verifyButton, isSending && { opacity: 0.6 }]}
  onPress={handleSendCode}
  disabled={isSending}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={styles.verifyButtonText}>
      {isSending ? t('sending') : t('sendingCode')}
    </Text>
    <View style={[styles.arrowCircle, { marginLeft: 10 }]}>
      <Image
        source={require('../assets/icons/next_white.png')}
        style={[styles.arrowIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }]}
      />
    </View>
  </View>
</TouchableOpacity>
          {(cooldownError || sendError) && (
            <Text style={styles.cooldownError}>{cooldownError || sendError}</Text>
          )}
        </>
      ) : (
        <>
          <View style={[styles.codeContainer,I18nManager.isRTL && { flexDirection: 'row-reverse' }]}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el: TextInput | null) => {
                  inputsRef.current[index] = el;
                }}
                style={styles.codeInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleInputChange(index, value)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.verifyButtonText]}>{t('waitVeriry')}</Text>
              <View style={[styles.arrowCircle, I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}, { marginLeft: 10 }]}>
                <Image source={require('../assets/icons/next_white.png')} style={styles.arrowIcon} />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.resendText}>
            {!cooldown ? (
              <Text style={styles.resendLink} onPress={handleSendCode}>
                {t('didntGetCode')} {t('resend')}
              </Text>
            ) : (
              `${t('didntGetCode')} ${t('resendIn')} ${cooldown}s`
            )}
          </Text>
        </>
      )}

      {statusMessage && (
        <Text style={[styles.statusMessage, { color: errorColor || '#000' }]}>
          {statusMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#1D2B64',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Poppins',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#1D2B64',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  email: {
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    color: '#1D2B64',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Poppins',
    color: '#1D2B64',
    fontWeight: '600',
    backgroundColor: '#F9F9F9',
  },
  verifyButton: {
    backgroundColor: '#1D2B64',
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: '100%',
    marginTop: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
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
    resizeMode: 'contain',
  },
  statusMessage: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  resendText: {
    marginTop: 18,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#777',
    textAlign: 'center',
  },
  resendLink: {
    color: '#1D2B64',
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  cooldownError: {
    marginTop: 10,
    color: '#D32F2F',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
});