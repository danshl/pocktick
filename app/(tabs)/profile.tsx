import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Switch,
  Alert,
  TextInput,
  ScrollView,
  Modal,
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

type UserProfile = {
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  ticketCount: number;
};

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleting, setDeleting] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
 
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

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

const handleDeletePress = () => {
  setShowConfirmModal(true);
};

const handleConfirmDeleteRequest = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    await requestAccountDeletion(token || '');
    setShowConfirmModal(false);
    setShowDeleteModal(true); // זה מה שפותח את חלון הקוד
  } catch (err: any) {
    Alert.alert('Error', err.message);
  }
};

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 75 }}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <Image source={require('../../assets/icons/account.png')} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.profileName}>{profile?.fullName || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Image source={require('../../assets/icons/logout.png')} style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      <SettingRow icon="person-outline" text="User Profile" onPress={() => router.push('/user-profile')} />
      <SettingRow icon="lock-closed-outline" text="Change Password" onPress={() => router.push('/change-password')} />
      <SettingRow icon="help-circle-outline" text="FAQs" onPress={() => router.push('/faqs')} />
      <SettingRow icon="checkmark-done-circle-outline" text="Seller Verification" onPress={() => router.push('/verify-seller')} />

      <View style={styles.settingRowContainer}>
        <View style={styles.rowLeft}>
          <Image source={require('../../assets/icons/notification.png')} style={styles.iconImage} />
          <Text style={styles.rowText}>Push Notification</Text>
        </View>
        <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#ccc', true: '#1D2B64' }} thumbColor="#fff" />
      </View>

      <TouchableOpacity onPress={handleDeletePress}>
        <Text style={styles.deleteText}>Delete My Account</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={showDeleteModal} onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.infoText}>
              A verification code has been sent to your email. Please enter it below to confirm account deletion.
            </Text>
            <TextInput placeholder="Enter code" style={styles.input} value={deleteCode} onChangeText={setDeleteCode} />
            <TouchableOpacity onPress={handleConfirmDelete} style={styles.confirmDeleteBtn}>
              <Text style={styles.confirmDeleteText}>{deleting ? 'Deleting...' : 'Confirm Deletion'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomConfirmModal
  visible={showConfirmModal}
  title="Delete Account"
  message="Are you sure you want to delete your account? This action is irreversible."
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
      <Feather name="chevron-right" size={20} color="#1D2B64" />
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