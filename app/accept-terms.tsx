import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  Platform,
  I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTranslation from './i18n/useTranslation';

export default function AcceptTermsScreen() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
console.log(isRTL,"s");
  const handleAccept = async () => {
    if (!accepted) {
      Alert.alert(t('acceptTermsAlert'));
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');

      const res = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/accept-terms',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to accept terms');
      router.replace('/load-screen');
    } catch (e) {
      Alert.alert(t('generalError'), t('redirectingToLogin'));
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <TouchableOpacity
        onPress={() => {
          if (router.canGoBack?.()) router.back();
          else router.replace('/login');
        }}
        style={styles.backButton}
      >
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={[styles.backIcon, isRTL && { transform: [{ rotate: '180deg' }] }]}
        />
      </TouchableOpacity>

      <View style={{ alignSelf: 'stretch' }}>
        <Text
          style={[
            styles.title,
            {
              textAlign: isRTL ? 'left' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('termsTitle')}
        </Text>

        <Text
          style={[
            styles.description,
            {
              textAlign: isRTL ? 'left' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {t('termsBeforeText')}{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://pocktick.com/terms-of-use')}
          >
            {t('termsLinkText')}
          </Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setAccepted(!accepted)}>
        <View style={[styles.checkboxBox, accepted && styles.checkboxBoxChecked]}>
          {accepted && <Text style={styles.checkmark}>V</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{t('termsCheckbox')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !accepted && { opacity: 0.5 }]}
        onPress={handleAccept}
        disabled={!accepted || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('termsProcessing') : t('termsAcceptButton')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 90,
    left: 20,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#1D2B64',
  },
  title: {
    fontSize: 22,
    marginTop: Platform.OS === 'ios' ? 200 : 120,
    marginBottom: 16,
    color: '#1D2B64',
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  link: {
    color: '#1D2B64',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1D2B64',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: '#1D2B64',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#1D2B64',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});