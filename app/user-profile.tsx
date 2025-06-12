import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_AVATAR = require('../assets/icons/user.png');

export default function UserProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const isImageAvailable = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const fetchAvatarUri = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/avatar-url', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const { avatarUrl } = await res.json();
      if (avatarUrl && await isImageAvailable(avatarUrl)) {
        setAvatarUri(`${avatarUrl}?t=${Date.now()}`);
      } else {
        setAvatarUri(null);
      }
    } catch {
      setAvatarUri(null);
    }
  };

  const fetchProfile = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setFullName(data.fullName);
    setEmail(data.email);
    setPhoneNumber(data.phoneNumber);
    setCreatedAt(data.createdAt);
  };

  const handleImagePick = async () => {
    Alert.alert('Upload Avatar', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) return;

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });

          if (!result.canceled && result.assets.length > 0) {
            uploadImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) return;

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });

          if (!result.canceled && result.assets.length > 0) {
            uploadImage(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadImage = async (imageUri: string) => {
    const token = await AsyncStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'avatar.png',
      type: 'image/png',
    } as any);

    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/upload-avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      Alert.alert('Upload Failed', 'Could not upload image');
      return;
    }

    fetchAvatarUri(); // עדכון מיידי מהשרת
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await fetchProfile();
        await fetchAvatarUri();
      };
      load();
    }, [])
  );

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
    if (!res.ok) {
      Alert.alert('Error', data.message || 'Something went wrong.');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully!');
    await AsyncStorage.setItem('userEmail', email);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backCircle}>
          <Image source={{ uri: 'https://tickectexchange.blob.core.windows.net/ui-assets/back-arrow.png' }} style={styles.backIcon} />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>User Profile</Text>

      <View style={styles.avatarContainer}>
        <Image source={avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR} style={styles.avatar} />
        <TouchableOpacity style={styles.cameraIcon} onPress={handleImagePick}>
          <Feather name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee', color: '#666' }]}
        value={email}
        editable={false}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

      <Text style={styles.createdText}>Joined on: {new Date(createdAt).toLocaleDateString()}</Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 120,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    paddingTop: 40,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5787E2',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  createdText: {
    fontSize: 13,
    color: '#888',
    alignSelf: 'center',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#1D2B64',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
