import React, { useEffect, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const LOCAL_AVATAR_PATH = `${FileSystem.documentDirectory}user-avatar.png`;

export default function UserProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [originalAvatarUri, setOriginalAvatarUri] = useState<string | null>(null); // שמור את מה שהיה
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null); // עריכה זמנית

  useEffect(() => {
    const loadProfile = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;

      const res = await fetch(`https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/profile/${userEmail}`);
      const data = await res.json();

      setFullName(data.fullName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);
      setCreatedAt(data.createdAt);

      const fileInfo = await FileSystem.getInfoAsync(LOCAL_AVATAR_PATH);
      
      if (fileInfo.exists) {
        setOriginalAvatarUri(fileInfo.uri);
        setTempAvatarUri(fileInfo.uri);
      }
    };

    loadProfile();
  }, []);

  const handleBack = () => {
    setTempAvatarUri(originalAvatarUri); // מבטל שינויים
    router.back();
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, email, phoneNumber }),
    });

    const data = await res.json();
    if (!res.ok) {
      Alert.alert('Error', data.message || 'Something went wrong.');
      return;
    }

    // אם התמונה שונתה – שמור לוקאלית ושלח לשרת
    if (tempAvatarUri && tempAvatarUri !== originalAvatarUri) {
      const formData = new FormData();
      formData.append('file', {
        uri: tempAvatarUri,
        name: 'avatar.png',
        type: 'image/png',
      } as any);      

      const uploadResponse = await fetch("https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/upload-avatar", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        Alert.alert("Upload failed", "Failed to upload avatar");
        return;
      }

      // מחק ושמור לוקאלית
      const existing = await FileSystem.getInfoAsync(LOCAL_AVATAR_PATH);

      if (existing.exists) {
        await FileSystem.deleteAsync(LOCAL_AVATAR_PATH);
      }
      await FileSystem.copyAsync({ from: tempAvatarUri, to: LOCAL_AVATAR_PATH });
      setOriginalAvatarUri(LOCAL_AVATAR_PATH); // עדכן את מה שנשמר
    }

    Alert.alert('Success', 'Profile updated successfully!');
    await AsyncStorage.setItem('userEmail', email);
  };

  const handleSelectImage = async () => {
    Alert.alert(
      'Upload Avatar',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission denied', 'We need access to your camera.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });

            if (!result.canceled && result.assets.length > 0) {
              setTempAvatarUri(result.assets[0].uri); // מיידית תציג
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission denied', 'We need access to your gallery.');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });

            if (!result.canceled && result.assets.length > 0) {
              setTempAvatarUri(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <View style={styles.backCircle}>
          <Image source={{ uri: 'https://tickectexchange.blob.core.windows.net/ui-assets/back-arrow.png' }} style={styles.backIcon} />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>User Profile</Text>

      <View style={styles.avatarContainer}>
        <Image source={tempAvatarUri ? { uri: tempAvatarUri } : require('../assets/icons/user.png')} style={styles.avatar} />
        <TouchableOpacity style={styles.cameraIcon} onPress={handleSelectImage}>
          <Feather name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

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
