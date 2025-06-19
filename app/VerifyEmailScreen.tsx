import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function VerifyEmailScreen() {
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
    if (cooldown > 0) {
      setCooldownError(`Please wait ${cooldown} seconds before trying again.`);
      setSendError(null);
      return;
    }

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
        setSendError(result.message || 'Unknown error');
      }
    } catch {
      setSendError('Server error: Could not send code.');
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
        setStatusMessage('🎉 Email verified successfully!');
        setErrorColor('#28A745');
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        setStatusMessage(result.message || 'Invalid code');
        setErrorColor('#D32F2F');
      }
    } catch {
      setStatusMessage('Error connecting to server.');
      setErrorColor('#D32F2F');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('../assets/icons/arrow-left.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>
        {!codeSent ? (
          <>
            Please verify your email address:{"\n"}
            <Text style={styles.email}>{email}</Text>{"\n"}
            We will send a 5-digit code to your email.
          </>
        ) : (
          <>
            A 5-digit code was sent to:{"\n"}
            <Text style={styles.email}>{email}</Text>{"\n"}
            Please verify your email within 60 minutes.
          </>
        )}
      </Text>

      {!codeSent ? (
        <>
          <TouchableOpacity style={styles.verifyButton} onPress={handleSendCode}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.verifyButtonText}>Send Code</Text>
              <View style={[styles.arrowCircle, { marginLeft: 10 }]}>
                <Image source={require('../assets/icons/next_white.png')} style={styles.arrowIcon} />
              </View>
            </View>
          </TouchableOpacity>
          {(cooldownError || sendError) && (
            <Text style={styles.cooldownError}>{cooldownError || sendError}</Text>
          )}
        </>
      ) : (
        <>
          <View style={styles.codeContainer}>
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
              <Text style={styles.verifyButtonText}>Verify</Text>
              <View style={[styles.arrowCircle, { marginLeft: 10 }]}>
                <Image source={require('../assets/icons/next_white.png')} style={styles.arrowIcon} />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.resendText}>
            {!cooldown ? (
              <Text style={styles.resendLink} onPress={handleSendCode}>
                Didn't get the code? Resend
              </Text>
            ) : (
              <>Didn't get the code? Resend in {cooldown}s</>
            )}
          </Text>
        </>
      )}

      {statusMessage && (
        <Text style={[styles.statusMessage, { color: errorColor || '#000' }]}> {statusMessage} </Text>
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
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