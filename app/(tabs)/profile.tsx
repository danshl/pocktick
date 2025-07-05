import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Image, Switch, Alert, TextInput, ScrollView, Modal,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getUserProfile,
  requestAccountDeletion,
  confirmAccountDeletion,
} from '../api/userApi';
import CustomConfirmModal from '../CustomConfirmModal';
import useTranslation from '../i18n/useTranslation';

type UserProfile = {
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  ticketCount: number;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState('');
const [alertMessage, setAlertMessage] = useState('');


  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const data = await getUserProfile(token || '');
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchUser();
  }, []));

  const handleDeletePress = () => setShowConfirmModal(true);

  const handleConfirmDeleteRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await requestAccountDeletion(token || '');
      setShowConfirmModal(false);
      setShowDeleteModal(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

const handleLogout = async () => {
  try {
    const language = await AsyncStorage.getItem('language'); // שומר את השפה
    await AsyncStorage.clear(); // מוחק את הכול
    if (language) {
      await AsyncStorage.setItem('language', language); // משחזר את השפה
    }
    router.replace('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      await confirmAccountDeletion(token || '', deleteCode);
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 75, flexGrow: 1 }}>
    <View style={{ paddingHorizontal: 18 }}>
      <Text style={[styles.title, I18nManager.isRTL && { textAlign: 'left' }]}>
        {t('profileTitle')}
      </Text>
    </View>

      <View style={styles.profileCard}>
        <Image source={require('../../assets/icons/account.png')} style={styles.avatar} />
        <View style={{ flex: 1 }}>
        <Text style={[styles.welcomeText, I18nManager.isRTL && { textAlign: 'left' }]}>{t('welcome')}</Text>
        <Text style={[styles.profileName, I18nManager.isRTL && { textAlign: 'left' }]}>
          {profile?.fullName || 'User'}
        </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Image source={require('../../assets/icons/logout.png')} style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      <SettingRow icon="person-outline" text={t('userProfile')} onPress={() => router.push('/user-profile')} />
      <SettingRow icon="lock-closed-outline" text={t('changePassword')} onPress={() => router.push('/change-password')} />
      <SettingRow icon="help-circle-outline" text={t('faqs')} onPress={() => router.push('/faqs')} />
      <SettingRow icon="checkmark-done-circle-outline" text={t('sellerVerification')} onPress={() => router.push('/verify-seller')} />
      <SettingRow icon="alert-circle-outline" text={t('appealTicket')} onPress={() => router.push('/appeal-screen')} />

      <View style={styles.settingRowContainer}>
        <View style={styles.rowLeft}>
          <Image source={require('../../assets/icons/notification.png')} style={styles.iconImage} />
          <Text style={styles.rowText}>{t('pushNotification')}</Text>
        </View>
        <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#ccc', true: '#1D2B64' }} thumbColor="#fff" />
      </View>

      <View style={{ paddingHorizontal: 12 }}>
        <TouchableOpacity onPress={handleDeletePress}>
          <Text style={styles.deleteText}>{t('deleteAccount')}</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent animationType="fade" visible={showDeleteModal} onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('confirmDeletion')}</Text>
            <Text style={styles.infoText}>{t('deletionInfo')}</Text>
            <TextInput placeholder={t('enterCode')} style={styles.input} value={deleteCode} onChangeText={setDeleteCode} />
            <TouchableOpacity onPress={handleConfirmDelete} style={styles.confirmDeleteBtn}>
              <Text style={styles.confirmDeleteText}>
                {deleting ? `${t('confirmBtn')}...` : t('confirmBtn')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.cancelModalText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomConfirmModal
        visible={showConfirmModal}
        title={t('modalDeleteTitle')}
        message={t('modalDeleteMessage')}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDeleteRequest}
      />
    </ScrollView>
  );
}

function SettingRow({ icon, text, onPress }: { icon: any; text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.settingRowContainer} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color="#1D2B64" />
        <Text style={styles.rowText}>{text}</Text>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color="#1D2B64"
        style={I18nManager.isRTL && { transform: [{ rotate: '180deg' }] }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  logoutBtn: {
    padding: 6,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  settingRowContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  deleteText: {
    color: '#FF3B30',
    fontFamily: 'Poppins-Regular',
    marginTop: 10,
    marginLeft: 4,
    fontSize: 14,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  confirmDeleteBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  cancelModalText: {
    marginTop: 10,
    color: '#888',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Regular',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 6,
  },
});