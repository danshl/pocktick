import React, { useEffect, useState } from 'react';
import { Text, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CustomAlert from './CustomAlert';
import useTranslation from './i18n/useTranslation';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      const transactionId = await AsyncStorage.getItem('lastTransactionId');
      const isInternal = await AsyncStorage.getItem('IsInternal');
      const token = await AsyncStorage.getItem('authToken');

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
        console.log('Verification response:', json);

        if (json.success) {
          setTimeout(() => {
            router.replace('/my-tickets');
          }, 2000);
        } else {
          setAlertTitle(t('payment_failed_title'));
          setAlertMessage(t('payment_failed_message'));
          setAlertVisible(true);
        }
      } catch (error) {
        //console.error('Verification error:', error);
        setAlertTitle(t('error'));
        setAlertMessage(t('connection_failed'));
        setAlertVisible(true);
      }
    };

    handleVerification();
  }, []);

const handleAlertClose = () => {
  setAlertVisible(false);
  router.replace('/my-tickets'); // ← מחזיר תמיד למסך הכרטיסים
};
  return (
    <View style={{ flex: 1, backgroundColor: '#EAF6FF' }}>
      <View style={{ alignItems: 'center', marginTop: 120 }}>
        <Image
          source={require('../assets/images/name.png')}
          style={{ width: 250, height: 120, resizeMode: 'contain', marginBottom: 40,right:10 }}
        />

      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </View>
  );
}