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

export default function VerifyCodeScreen() {
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
  setIsLoading(true); // התחלת טעינה

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
      setStatusMessage('Reset successful');
      setAttemptsLeft(4);
      router.push({
        pathname: '/SetNewPasswordScreen',
        params: { email, resetToken: result.resetToken },
      });
    } else {
      const isAttemptsMsg = result.message?.toLowerCase().includes('too many');
      if (isAttemptsMsg || attemptsLeft === 1) {
        setStatusMessage('Too many failed attempts. Redirecting...');
        setTimeout(() => router.replace('/login'), 2000);
      } else {
        setAttemptsLeft((prev) => prev - 1);
        setStatusMessage('Incorrect code');
      }
    }
  } catch (error) {
    setStatusMessage('Error verifying code');
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
        setStatusMessage('A new code has been sent to your email.');
      } else {
        setStatusMessage('Failed to resend code. Please try again.');
      }
    } catch (error) {
      setStatusMessage('Server error while resending code.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('../assets/icons/arrow-left.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We sent a reset link to <Text style={styles.email}>{email}</Text>{'\n'}
        Enter the 5-digit code mentioned in the email
      </Text>

      <View style={styles.codeContainer}>
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
        {isLoading ? 'Verifying Your Code...' : 'Verify Email Code'}
      </Text>

      {!isLoading && (
        <View style={styles.arrowCircle}>
          <Image
            source={require('../assets/icons/next_white.png')}
            style={styles.arrowIcon}
          />
        </View>
      )}
    </TouchableOpacity>



      {statusMessage && (
        <Text
          style={[
            styles.statusMessage,
            statusMessage === 'Incorrect code' ? { color: '#FF3B30', } : {},
          ]}
        >
          {statusMessage}
          {attemptsLeft >= 0 && statusMessage === 'Incorrect code'
            ? `. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left.`
            : ''}
        </Text>
      )}

      <Text style={styles.resendText}>
        {cooldown === 0 ? (
          <>
            Didn't get the code?{' '}
            <Text style={styles.resendLink} onPress={handleResendCode}>
              Resend email
            </Text>
          </>
        ) : (
          <>Resend available in {cooldown}s</>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 310,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#1D2B64',
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
