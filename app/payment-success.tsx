import React, { useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function PaymentSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleVerification = async () => {
      const transactionId = await AsyncStorage.getItem('lastTransactionId');
      const isInternal = await AsyncStorage.getItem('IsInternal');
      const token = await AsyncStorage.getItem('authToken');
      console.log(isInternal);
      if (!transactionId || !token) return;

      const url = isInternal === 'true'
        ? `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/pay-plus/verify-payment?transactionId=${transactionId}`
        : `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/verify-external-payment?transferId=${transactionId}`;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        console.log('✅ Verification response:', json);

        if (json.success) {
          setTimeout(() => {
            router.replace('/my-tickets');
          }, 2000); // המתנה של 2 שניות לפני מעבר
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
      }
    };

    handleVerification();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#EAF6FF' }}>
      <View style={{ alignItems: 'center', marginTop: 120 }}>
        <Image
          source={require('../assets/images/name.png')}
          style={{ width: 250, height: 120, resizeMode: 'contain', marginBottom: 40 }}
        />

        <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1D2B64' }}>
          The payment was completed successfully!
        </Text>

        <Image
          source={require('../assets/images/just_logo.png')}
          style={{
            width: 250,
            height: 200,
            resizeMode: 'contain',
            marginTop: 60,
            marginBottom: 40,
            marginLeft: -60,
          }}
        />
      </View>
    </View>
  );
}