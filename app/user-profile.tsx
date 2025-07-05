import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CustomAlert from './CustomAlert';
import useTranslation from './i18n/useTranslation';

export default function UserProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFullName(data.fullName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);
      setCreatedAt(data.createdAt);
    })();
  }, []);

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, phoneNumber }),
    });

    const data = await res.json();
    if (res.ok) {
      setAlertMessage(t('profileSaved'));
      setShowAlert(true);
      await AsyncStorage.setItem('userEmail', email);
    } else {
      setAlertMessage(data.message || t('updateError'));
      setShowAlert(true);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={[styles.backIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }]}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{t('userProfileTitle')}</Text>

      <Image source={require('../assets/icons/account.png')} style={styles.avatar} />
      <Text style={styles.name}>{fullName}</Text>

<View style={styles.fieldGroup}>
  <View style={[styles.labelRow, { flexDirection: 'row', alignItems: 'center' }]}>
    <Image
      source={require('../assets/icons/user.png')}
      style={[
        styles.icon,
        I18nManager.isRTL ? { marginLeft: 6 } : { marginRight: 6 },
      ]}
    />
    <Text
      style={[
        styles.label,
        I18nManager.isRTL && { textAlign: 'right', writingDirection: 'rtl' },
      ]}
    >
      {t('fullName')}
    </Text>
  </View>
  <View style={styles.inputWrapper}>
    <TextInput
      style={[
        styles.input,
        I18nManager.isRTL && { textAlign: 'right', writingDirection: 'rtl' },
      ]}
      value={fullName}
      onChangeText={setFullName}
    />
  </View>
</View>

<View style={styles.fieldGroup}>
  <View style={[styles.labelRow, { flexDirection: 'row', alignItems: 'center' }]}>
    <Image
      source={require('../assets/icons/Message.png')}
      style={[
        styles.icon,
        I18nManager.isRTL ? { marginLeft: 6 } : { marginRight: 6 },
      ]}
    />
    <Text
      style={[
        styles.label,
        { marginTop: 4 }, // ⬅️ זו השורה שמיישרת את הטקסט לגובה האייקון
        I18nManager.isRTL && { textAlign: 'right', writingDirection: 'rtl' },
      ]}
    >
      {t('email')}
    </Text>
  </View>

  <View style={[styles.inputWrapper, styles.disabledWrapper]}>
    <TextInput
      style={[
        styles.input,
        styles.disabledInput,
        I18nManager.isRTL && { textAlign: 'right', writingDirection: 'rtl' },
      ]}
      value={email}
      editable={false}
    />
  </View>
</View>

<View style={styles.fieldGroup}>
  <View style={[styles.labelRow, { flexDirection: 'row', alignItems: 'center' }]}>
    <Image
      source={require('../assets/icons/phone.png')}
      style={[
        styles.icon,
        I18nManager.isRTL ? { marginLeft: 6 } : { marginRight: 6 },
      ]}
    />
    <Text
      style={[
        styles.label,
        I18nManager.isRTL && { textAlign: 'right', writingDirection: 'rtl' },
      ]}
    >
      {t('phone')}
    </Text>
  </View>
  <View style={styles.inputWrapper}>
    <TextInput
      style={[
        styles.input,
        I18nManager.isRTL && { textAlign: 'right', writingDirection: 'rtl' },
      ]}
      value={phoneNumber}
      onChangeText={setPhoneNumber}
      keyboardType="phone-pad"
    />
  </View>
</View>

      <Text style={styles.joinedText}>
        {t('joinedOn')} {new Date(createdAt).toLocaleDateString('en-GB')}
      </Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{t('save')}</Text>
        <View style={styles.arrowCircle}>
          <Image source={require('../assets/icons/next_white.png')} style={[styles.arrowIcon,  I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]} />
        </View>
      </TouchableOpacity>

      <CustomAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#fff',
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
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
    textAlign: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 12,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#1D2B64',
    fontSize: 16,
    marginBottom: 4,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  icon: {
    width: 18,
    height: 18,
    marginLeft: 5,
    resizeMode: 'contain',
    tintColor: '#1D2B64',
  },
  joinedText: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginVertical: 10,
  },
saveButton: {
  backgroundColor: '#1D2B64',
  borderRadius: 20,
  height: 56,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 20,
  width: 335,
  alignSelf: 'center',
  marginTop: 10,
},
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    flex: 1,
    textAlign: 'center',
  },
  arrowCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  disabledWrapper:{
    backgroundColor: '#f0f0f0'
  },
  labelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
  marginHorizontal: 5,
},
});