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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

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
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      const response = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

const handleConfirmDelete = async (code: string) => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    const response = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/confirm-delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      // קרא את התגובה רק פעם אחת
      let message = 'Failed to delete account.';
      try {
        const error = await response.json();
        message = error?.message || message;
      } catch (e) {
        console.warn('Could not parse error response');
      }
      Alert.alert('Error', message);
      return;
    }

    await AsyncStorage.clear();
    router.replace('/login');
  } catch (error) {
    console.error('Error confirming account deletion:', error);
    Alert.alert('Error', 'Something went wrong.');
  }
};

  const isImageAvailable = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('HEAD request failed:', error);
      return false;
    }
  };

  const fetchAvatarUri = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setAvatarUri(null);
        return;
      }

      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/avatar-url',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        setAvatarUri(null);
        return;
      }

      const { avatarUrl } = await response.json();

      if (
        avatarUrl &&
        typeof avatarUrl === 'string' &&
        avatarUrl.startsWith('http') &&
        await isImageAvailable(avatarUrl)
      ) {
        setAvatarUri(`${avatarUrl}?t=${Date.now()}`);
      } else {
        setAvatarUri(null);
      }

    } catch (err) {
      console.warn('Failed to fetch avatar URL:', err);
      setAvatarUri(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await fetchUserProfile();
        await fetchAvatarUri();
      };
      load();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userEmail');
    router.replace('/login');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#5787E2" style={styles.loader} />;
  }

  if (error || !profile) {
    return <Text style={styles.errorText}>{error || "Failed to load profile."}</Text>;
  }

return (
  <View style={styles.container}>
    <Text style={styles.title}>Settings</Text>

    <View style={styles.profileHeader}>
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require('../../assets/icons/user.png')
        }
        style={styles.avatar}
      />
      <View>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.profileName}>{profile.fullName}</Text>
      </View>
      <Feather name="log-out" size={24} color="#FF3B30" style={styles.logoutIcon} onPress={handleLogout} />
    </View>

    <TouchableOpacity style={styles.settingItem} onPress={() => router.push('../user-profile')}>
      <View style={styles.settingRow}>
        <Ionicons name="person-outline" size={24} color="#333" />
        <Text style={styles.settingText}>User Profile</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/change-password')}>
      <View style={styles.settingRow}>
        <Feather name="lock" size={24} color="#333" />
        <Text style={styles.settingText}>Change Password</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/faqs')}>
      <View style={styles.settingRow}>
        <Feather name="help-circle" size={24} color="#333" />
        <Text style={styles.settingText}>FAQs</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>

    <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/verify-seller')}>
      <View style={styles.settingRow}>
        <Feather name="check-circle" size={24} color="#333" />
        <Text style={styles.settingText}>Seller Verification</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>

    <View style={styles.settingItem}>
      <View style={styles.settingRow}>
        <Feather name="bell" size={24} color="#333" />
        <Text style={styles.settingText}>Push Notification</Text>
      </View>
      <Switch value={notifications} onValueChange={() => setNotifications(!notifications)} />
    </View>

<TouchableOpacity
  style={styles.deleteButton}
  onPress={async () => {
    Alert.alert(
      "Are you sure?",
      "This will permanently delete your account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/request-delete', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const error = await response.json();
                Alert.alert("Error", error.message || "Failed to request deletion code.");
                return;
              }

              Alert.alert("Code Sent", "A verification code was sent to your email.");
              setShowDeleteModal(true);
            } catch (err) {
              console.error("Error requesting deletion code:", err);
              Alert.alert("Error", "Something went wrong while requesting the code.");
            }
          },
        }
      ]
    );
  }}
>
  <View style={styles.deleteContent}>

    <Text style={styles.deleteText}>Delete My Account</Text>
  </View>
</TouchableOpacity>

    {/* 👇 זה המודל שמופיע אחרי אישור המחיקה */}
    {showDeleteModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
      <Text style={styles.modalText}>Enter the code sent to your email</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Code"
        secureTextEntry={false}
      />
      <TouchableOpacity
        style={styles.confirmDeleteBtn}
        onPress={() => handleConfirmDelete(password)}
      >
        <Text style={styles.confirmDeleteText}>
          {deleting ? 'Deleting...' : 'Confirm Deletion'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
        <Text style={styles.cancelModalText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
  </View>
);
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutIcon: {
    marginLeft: 'auto',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    height: 60,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
  },
modalOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},

modalBox: {
  width: '85%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  alignItems: 'center',
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},

modalText: {
  fontSize: 14,
  marginBottom: 15,
  textAlign: 'center',
},

confirmDeleteBtn: {
  backgroundColor: '#FF3B30',
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 8,
  marginTop: 10,
  width: '100%',
  alignItems: 'center',
},

confirmDeleteText: {
  color: '#fff',
  fontWeight: 'bold',
},

cancelModalText: {
  color: '#888',
  marginTop: 15,
  textDecorationLine: 'underline',
},
input: {
  width: '100%',
  height: 50,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginBottom: 15,
  backgroundColor: '#fff',
},
deleteButton: {
  backgroundColor: '#fff',
  padding: 15,
  borderRadius: 12,
  marginTop: 30,
  borderWidth: 1,
  borderColor: '#FF3B30',
  height: 60,
  justifyContent: 'center',
},

deleteContent: {
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  height: '100%',
},

deleteText: {
  fontSize: 16,
  color: '#FF3B30',
  fontWeight: 'bold',
  textAlign: 'center',
},
});
