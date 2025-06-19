import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      setStatus(['submitted', 'approved', 'rejected'].includes(formatted) ? formatted : 'not_submitted');
    } else {
      setStatus('not_submitted');
    }
  };

  const handleSubmit = async () => {
    if (!facebookLink || !idImageUri || !additionalIdUri) {
      Alert.alert('Missing Info', 'Please fill all fields and upload all files.');
      return;
    }
    const token = await AsyncStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('facebookUrl', facebookLink);
    formData.append('idImage', { uri: idImageUri, name: 'id.jpg', type: 'image/jpeg' } as any);
    formData.append('additionalId', { uri: additionalIdUri, name: 'extra.jpg', type: 'image/jpeg' } as any);

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image source={require('../assets/icons/arrow-left.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {status === 'approved' ? (
        <View style={styles.centeredContainer}>
          <Image source={require('../assets/icons/verified.png')} style={styles.verifiedImage} />
          <View style={styles.confirmedBox}>
            <Text style={styles.confirmedText}>
              You are verified as a seller.{"\n"}
              You can now transfer tickets from companies that are not officially supported on the platform.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Verify Seller</Text>
          <Text style={styles.description}>
            To sell tickets for unofficial partners, please submit your Facebook profile, a photo of your ID and an additional ID (e.g., passport or license).
          </Text>

          <View style={styles.formSection}>
            <Text style={[styles.label, disabled && styles.labelDisabled]}>Facebook Profile Link</Text>
            <TextInput
              style={[styles.input, disabled ? styles.inputDisabled : styles.inputEnabled]}
              value={facebookLink}
              onChangeText={setFacebookLink}
              placeholder="https://facebook.com/your-profile"
              editable={!disabled}
            />

            <UploadSection
              label="Upload ID Image"
              value={idImageUri}
              onPress={() => pickFile('image', setIdImageUri)}
              disabled={disabled}
            />

            <UploadSection
              label="Upload Additional ID"
              value={additionalIdUri}
              onPress={() => pickFile('image', setAdditionalIdUri)}
              disabled={disabled}
            />

            {/* <UploadSection
              label="Upload Selfie Video (until 5 sec)"
              value={videoUri}
              onPress={() => pickFile('video', setVideoUri)}
              disabled={disabled}
            /> */}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={disabled}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

          {status === 'submitted' && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingText}>
                Your verification has been submitted and is under review. Please wait for approval.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function UploadSection({ label, value, onPress, disabled }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      <TouchableOpacity
        style={[styles.uploadButton, disabled ? styles.uploadButtonDisabled : styles.uploadButtonEnabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {value ? (
          <View style={styles.uploadedRow}>        
            <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>Uploaded</Text>
            <Image source={require('../assets/icons/checkmark.png')} style={styles.checkIcon} />
          </View>
        ) : (
          <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
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
    marginBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#1D2B64',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1D2B64',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
  },
  labelDisabled: {
    color: '#aaa',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
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
  uploadButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonEnabled: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1D2B64',
  },
  uploadButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  uploadText: {
    fontSize: 14,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
  },
  uploadTextDisabled: {
    color: '#aaa',
  },
  submitButton: {
    backgroundColor: '#1D2B64',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  pendingBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1D2B64',
    marginTop: 10,
  },
  pendingText: {
    textAlign: 'center',
    color: '#1D2B64',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center', 
    marginTop: 90,
    paddingHorizontal: 20,
  },
  confirmedBox: {
    marginTop: 70,
    paddingHorizontal: 10,
  },
  confirmedText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: '#1D2B64',
  },
  verifiedImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  uploadedRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
checkIcon: {
  width: 18,
  height: 18,
  resizeMode: 'contain',
  tintColor: '#1D2B64',
},
});