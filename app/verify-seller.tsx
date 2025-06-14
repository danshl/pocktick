import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
export default function VerifySellerScreen() {
  const router = useRouter();
  const [facebookLink, setFacebookLink] = useState('');
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [additionalIdUri, setAdditionalIdUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'not_submitted' | 'submitted' | 'approved' | 'rejected'>('not_submitted');

  const pickFile = async (type: 'image' | 'video', setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

const fetchStatus = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/sellerverification/status', {
    headers: { Authorization: `Bearer ${token}` },
  });

if (res.ok) {
  const { status: backendStatus } = await res.json();
  const formatted = backendStatus?.toLowerCase();

  if (['submitted', 'approved', 'rejected'].includes(formatted)) {
    setStatus(formatted);
  } else {
    setStatus('not_submitted');
  }
} else {
  setStatus('not_submitted');
}
};

  const handleSubmit = async () => {
    if (!facebookLink || !idImageUri || !additionalIdUri || !videoUri) {
      Alert.alert('Missing Info', 'Please fill all fields and upload all files.');
      return;
    }
    const token = await AsyncStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('facebookUrl', facebookLink);
    formData.append('idImage', {
      uri: idImageUri,
      name: 'id.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('additionalId', {
      uri: additionalIdUri,
      name: 'extra.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('video', {
      uri: videoUri,
      name: 'selfie.mp4',
      type: 'video/mp4',
    } as any);

    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/sellerverification/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      Alert.alert('Submitted', 'Your verification request was submitted.');
      setStatus('submitted');
    } else {
      Alert.alert('Error', 'Submission failed. Try again.');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);
const disabled = status === 'submitted' || status === 'approved';

if (status === 'approved') {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.centeredContainer}>
        <Image
          source={require('../assets/images/verified.png')}
          style={styles.verifiedImage}
        />
        <View style={styles.confirmedBox}>
          <Text style={styles.confirmedText}>
        You are verified as a seller.{'\n'}
        You can now transfer tickets from companies that are not officially supported on the platform.
        </Text>
        </View>
      </View>
    </ScrollView>
  );
}

return (
  <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Feather name="arrow-left" size={24} color="#000" />
    </TouchableOpacity>

    <Text style={styles.title}>Verify Seller</Text>
    <Text style={styles.description}>
      To sell tickets for unofficial partners, please submit your Facebook profile, a photo of your ID, an additional ID (e.g., passport or license), and a short selfie video.
    </Text>

    <Text style={[styles.label, disabled && styles.labelDisabled]}>
      Facebook Profile Link
    </Text>
    <TextInput
      style={[styles.input, disabled ? styles.inputDisabled : styles.inputEnabled]}
      value={facebookLink}
      onChangeText={setFacebookLink}
      placeholder="https://facebook.com/your-profile"
      editable={!disabled}
    />

    <Text style={[styles.label, disabled && styles.labelDisabled]}>
      Upload ID Image
    </Text>
    <TouchableOpacity
      style={[
        styles.uploadButton,
        disabled ? styles.uploadButtonDisabled : styles.uploadButtonEnabled,
      ]}
      onPress={() => pickFile('image', setIdImageUri)}
      disabled={disabled}
    >
      <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>
        {idImageUri ? 'ID Image Selected' : 'Upload ID Image'}
      </Text>
    </TouchableOpacity>

    <Text style={[styles.label, disabled && styles.labelDisabled]}>
      Upload Additional ID
    </Text>
    <TouchableOpacity
      style={[
        styles.uploadButton,
        disabled ? styles.uploadButtonDisabled : styles.uploadButtonEnabled,
      ]}
      onPress={() => pickFile('image', setAdditionalIdUri)}
      disabled={disabled}
    >
      <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>
        {additionalIdUri ? 'Additional ID Selected' : 'Upload Additional ID'}
      </Text>
    </TouchableOpacity>

    <Text style={[styles.label, disabled && styles.labelDisabled]}>
      Upload Selfie Video
    </Text>
    <TouchableOpacity
      style={[
        styles.uploadButton,
        disabled ? styles.uploadButtonDisabled : styles.uploadButtonEnabled,
      ]}
      onPress={() => pickFile('video', setVideoUri)}
      disabled={disabled}
    >
      <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>
        {videoUri ? 'Video Selected' : 'Upload Video'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.submitButton,
        disabled && styles.submitButtonDisabled,
      ]}
      onPress={handleSubmit}
      disabled={disabled}
    >
      <Text style={styles.submitText}>SUBMIT</Text>
    </TouchableOpacity>

    {status === 'submitted' && (
      <View style={styles.pendingBox}>
        <Text style={styles.pendingText}>
          Your verification has been submitted and is under review. Please wait for approval.
        </Text>
      </View>
    )}
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    height: 50,
    borderColor: '#1D2B64',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  uploadButton: {
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
 
  submitButton: {
    backgroundColor: '#1D2B64',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
pendingBox: {
 
  padding: 15,
  borderRadius: 8,
  marginTop: 20,
  borderWidth: 1,
  borderColor: '#1D2B64', // גבול כחול כהה
},

pendingText: {
  color: '#1D2B64', // טקסט כחול כהה
  fontSize: 14,
  textAlign: 'center',
  fontWeight: '600',
},
 
uploadButtonEnabled: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#1D2B64', // כחול כהה
  borderRadius: 8,
},

uploadText: {
  fontSize: 14,
  color: '#1D2B64', // טקסט כחול
},

uploadButtonDisabled: {
  backgroundColor: '#f0f0f0',
},

uploadTextDisabled: {
  color: '#aaa',
},
labelDisabled: {
  color: '#aaa',
},
submitButtonDisabled: {
  backgroundColor: '#ccc',
},
inputEnabled: {
  borderColor: '#1D2B64',
  color: '#1D2B64',
},

inputDisabled: {
  borderColor: '#ccc',
  backgroundColor: '#f0f0f0',
  color: '#999',
},
centeredContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 0,
},

confirmedBox: {
 
},

confirmedText: {
 
  fontSize: 18,
  textAlign: 'center',
  fontWeight: '600',
},

verifiedImage: {
  width: 200,
  height: 200,
  resizeMode: 'contain',
  marginBottom: 15,
},
});