import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorColor, setErrorColor] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
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

  const handleSendCode = async () => {
    try {
      const response = await fetch("https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/send-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (response.ok) {
        //Alert.alert("Verification code sent!", "Check your inbox.");
        setCodeSent(true);
        setCooldown(60);
      } else {
        Alert.alert("Failed to send code", result.message || "Unknown error");
      }
    } catch {
      Alert.alert("Server error", "Could not send code.");
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join("");
    try {
      const response = await fetch("https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const result = await response.json();
      if (response.ok) {
        setStatusMessage("🎉 Email verified successfully!");
        setErrorColor("#28A745");
        setTimeout(() => router.replace("/login"), 2000);
      } else {
        setStatusMessage(result.message || "Invalid code");
        setErrorColor("#D32F2F");
      }
    } catch {
      setStatusMessage("Error connecting to server.");
      setErrorColor("#D32F2F");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backCircle}>
          <Image source={require('../assets/icons/back-arrow.png')} style={styles.backIcon} />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>
        {!codeSent ? (
          <>
            Please verify your email address:
            {"\n"}<Text style={styles.email}>{email}</Text>{"\n"}
            We will send a 5-digit code to your email.
          </>
        ) : (
          <>
            A 5-digit code was sent to:
            {"\n"}<Text style={styles.email}>{email}</Text>{"\n"}
            Please verify your email within 60 minutes.
          </>
        )}
      </Text>

      {!codeSent ? (
        <TouchableOpacity style={styles.verifyButton} onPress={handleSendCode}>
          <Text style={styles.verifyButtonText}>Send Code</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                style={styles.codeInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleInputChange(index, value)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>

          <Text style={styles.resendText}>
            {!cooldown ? (
              <Text style={styles.resendLink} onPress={handleSendCode}>Didn't get the code? Resend</Text>
            ) : (
              <>Didn't get the code? Resend in {cooldown}s</>
            )}
          </Text>
        </>
      )}

      {statusMessage && (
        <Text style={[styles.statusMessage, { color: errorColor || "#000" }]}> {statusMessage} </Text>
      )}
    </View>
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
    top: 90,
    left: 20,
    zIndex: 10,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 25,
    height: 22,
    tintColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 100,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  email: {
    color: '#000',
    fontWeight: 'bold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    marginHorizontal: 5,
  },
  verifyButton: {
    backgroundColor: '#1D2B64',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusMessage: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendText: {
    marginTop: 16,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  resendLink: {
    color: '#1D2B64',
    fontWeight: 'bold',
  },
});
