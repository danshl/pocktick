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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTranslation from './i18n/useTranslation';
import { I18nManager } from 'react-native';
import CustomAlert from './CustomAlert';
export default function VerifySellerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [facebookLink, setFacebookLink] = useState('');
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [additionalIdUri, setAdditionalIdUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'not_submitted' | 'submitted' | 'approved' | 'rejected'>('not_submitted');
  const [isSubmitting, setIsSubmitting] = useState(false);
const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState('');
const [alertMessage, setAlertMessage] = useState('');

const showAlert = (title: string, message: string) => {
  setAlertTitle(title);
  setAlertMessage(message);
  setAlertVisible(true);
};
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
    showAlert(t('missingInfoTitle'), t('missingInfoBody'));
    return;
  }

  try {
    setIsSubmitting(true);
    const token = await AsyncStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('facebookUrl', facebookLink);
    formData.append('idImage', { uri: idImageUri, name: 'id.jpg', type: 'image/jpeg' } as any);
    formData.append('additionalId', { uri: additionalIdUri, name: 'extra.jpg', type: 'image/jpeg' } as any);

    const res = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/sellerverification/submit',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (res.ok) {
      showAlert(t('submitted'), t('submittedSuccess'));
      setStatus('submitted');
    } else {
      showAlert(t('error'), t('submissionFailed'));
    }
  } catch (e) {
    showAlert(t('error'), t('unexpectedError'));
  } finally {
    setIsSubmitting(false);
  }
};
  useEffect(() => {
    fetchStatus();
  }, []);

  const disabled = status === 'submitted' || status === 'approved';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image source={require('../assets/icons/arrow-left.png')} style={[styles.backIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]} />
      </TouchableOpacity>

      {status === 'approved' ? (
        <View style={styles.centeredContainer}>
          <Image source={require('../assets/icons/verified.png')} style={styles.verifiedImage} />
          <View style={styles.confirmedBox}>
            <Text style={styles.confirmedText}>{t('approvedMessage')}</Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.title}>{t('verifySellerTitle')}</Text>
          <Text style={styles.description}>{t('verifySellerDescription')}</Text>

          <View style={styles.formSection}>
            <Text style={[styles.label, disabled && styles.labelDisabled]}>{t('facebookLabel')}</Text>
            <TextInput
              style={[styles.input, disabled ? styles.inputDisabled : styles.inputEnabled]}
              value={facebookLink}
              onChangeText={setFacebookLink}
              placeholder="https://facebook.com/your-profile"
              editable={!disabled}
            />

            <UploadSection
              label={t('uploadIdImage')}
              value={idImageUri}
              onPress={() => pickFile('image', setIdImageUri)}
              disabled={disabled}
            />

            <UploadSection
              label={t('uploadAdditionalId')}
              value={additionalIdUri}
              onPress={() => pickFile('image', setAdditionalIdUri)}
              disabled={disabled}
            />
          </View>

{status === 'not_submitted' && (
<TouchableOpacity
  style={[
    styles.submitButton,
    (disabled || isSubmitting) && styles.submitButtonDisabled
  ]}
  onPress={handleSubmit}
  disabled={disabled || isSubmitting}
>
  <Text style={styles.submitText}>
    {isSubmitting ? t('submitting') : t('submit')}
  </Text>

  <View
    style={[
      styles.arrowCircle,
      I18nManager.isRTL ? { right: 20 } : { left: 20 }, // קצה הכפתור
    ]}
  >
    <Image
      source={require('../assets/icons/next_white.png')}
      style={[
        styles.arrowIconImage,
        I18nManager.isRTL && { transform: [{ rotate: '180deg' }] },
      ]}
    />
  </View>
</TouchableOpacity>
)}

          {status === 'submitted' && (
            <View style={styles.pendingBox}>
              <Text style={styles.pendingText}>{t('underReviewMessage')}</Text>
            </View>
          )}
        </>
      )}
      <CustomAlert
  visible={alertVisible}
  title={alertTitle}
  message={alertMessage}
  onClose={() => setAlertVisible(false)}
/>
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
            <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>{label}</Text>
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
  textAlign: I18nManager.isRTL ? 'left' : 'left',
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
  textAlign: I18nManager.isRTL ? 'left' : 'left', // 🧠 יישור תוכן
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
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#1D2B64',
  borderRadius: 20,
  height: 56,
  paddingVertical: 14,
  paddingHorizontal: 20,
  width: 335,
  alignSelf: 'center',
  marginTop: 10,
  position: 'relative', // חשוב בשביל החץ!
},

submitButtonDisabled: {
  backgroundColor: '#9fa9c7',
},

submitText: {
  color: '#fff',
  fontSize: 17,
  fontFamily: 'Poppins-Bold',
  textAlign: 'center',
},

arrowCircle: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(255,255,255,0.2)',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute', // מצמיד לצד
  top: 12,
},

arrowIconImage: {
  width: 16,
  height: 16,
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
submitContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', // חשוב!
  width: '100%',
},

arrowWrapper: {
  position: 'absolute',
  right: 20, // או left: 20 אם RTL
},

 
});