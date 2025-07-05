import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { submitExternalTransfer } from './api/externalTransfer';
import useTranslation from './i18n/useTranslation';
import { I18nManager } from 'react-native';
import CustomConfirmModal from './CustomConfirmModal';
import CustomAlert from './CustomAlert';

export default function ExternalUploadScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [ticketCount, setTicketCount] = useState('');
  const [eventName, setEventName] = useState('');
  const [seatLocation, setSeatLocation] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [gatesOpenTime, setGatesOpenTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});
  const [onCancel, setOnCancel] = useState<() => void>(() => () => {});
  const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState('');
const [alertMessage, setAlertMessage] = useState('');
const [onAlertClose, setOnAlertClose] = useState<() => void>(() => () => {});
  type FileItem = { uri: string; name: string };
  const [fileUris, setFileUris] = useState<FileItem[]>([]);
  const removeFile = (uriToRemove: string) =>
    setFileUris(prev => prev.filter(file => file.uri !== uriToRemove));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('permission_denied'), t('need_media_permission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFileUris(prev => [...prev, {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || 'Image'
      }]);
    }
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.assets && result.assets.length > 0) {
        setFileUris(prev => [...prev, {
          uri: result.assets[0].uri,
          name: result.assets[0].name || 'PDF'
        }]);
      }
    } catch (err) {
      console.error('PDF error:', err);
      Alert.alert(t('error_picking_pdf'));
    }
  };

const handleSubmit = async () => {
  if (
    !eventName || !seatLocation || !dateTime || !ticketCount ||
    !buyerEmail || !price || !location || !startTime ||
    !gatesOpenTime || fileUris.length === 0
  ) {
    setAlertTitle(t('missing_fields'));
    setAlertMessage(t('fill_required_fields'));
    setAlertVisible(true);
    return;
  }

  setConfirmTitle(t('confirm_fee_title'));
  setConfirmMessage(t('confirm_fee_message'));

  setOnConfirm(() => async () => {
    setConfirmVisible(false);
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');

      await submitExternalTransfer({
        eventName,
        seatLocation,
        dateTime,
        additionalDetails: details,
        ticketCount,
        buyerEmail,
        price,
        location,
        startTime,
        gatesOpenTime,
        fileUris: fileUris.map(f => f.uri),
        token,
      });


setAlertMessage(t('transfer_submitted'));
setAlertVisible(true);

// תכניס את הפעולה ל-onClose אחר כך
setOnAlertClose(() => () => router.back());
    } catch (err) {
      setAlertTitle(t('submission_failed'));
      setAlertMessage(t('check_fields_again'));
      setAlertVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  });

  setOnCancel(() => () => {
    setConfirmVisible(false);
  });

  setConfirmVisible(true);
};

  return (
    <View style={styles.wrapper}>
      <View style={styles.whiteContainer}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton,I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}>
          <MaterialIcons name="arrow-back" size={28} color="#1D2B64" />
        </TouchableOpacity>
        <Image source={require('../assets/icons/logo_full_blue.png')} style={styles.headerImage} />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>{t('upload_and_sell_ticket')}</Text>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/Subtract.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('ticket_count')}
    placeholderTextColor="#807A7A"
    value={ticketCount}
    onChangeText={setTicketCount}
    keyboardType="numeric"
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/Message.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('event_name')}
    placeholderTextColor="#807A7A"
    value={eventName}
    onChangeText={setEventName}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/seats.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('seat_location')}
    placeholderTextColor="#807A7A"
    value={seatLocation}
    onChangeText={setSeatLocation}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/arroba.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('buyer_email')}
    placeholderTextColor="#807A7A"
    value={buyerEmail}
    onChangeText={setBuyerEmail}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/calendar.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={`${t('date_time')} (dd/mm/yyyy)`}
    placeholderTextColor="#807A7A"
    value={dateTime}
    onChangeText={setDateTime}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/location.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('location')}
    placeholderTextColor="#807A7A"
    value={location}
    onChangeText={setLocation}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/clock.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('start_time')}
    placeholderTextColor="#807A7A"
    value={startTime}
    onChangeText={setStartTime}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/timeGate.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('gates_open')}
    placeholderTextColor="#807A7A"
    value={gatesOpenTime}
    onChangeText={setGatesOpenTime}
  />
</View>

<View style={styles.inputWithIcon}>
  <Image source={require('../assets/icons/price.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputField}
    placeholder={t('price')}
    placeholderTextColor="#807A7A"
    value={price}
    onChangeText={setPrice}
    keyboardType="numeric"
  />
</View>

<View style={styles.inputWithIcon}>
 
  <TextInput
    style={[styles.inputField]}
    placeholder={t('additional_details')}
    placeholderTextColor="#807A7A"
    value={details}
    onChangeText={setDetails}
    multiline
  />
</View>
                  <Text style={styles.sectionTitle}>{t('upload_ticket_files')}</Text>

          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              <Text style={styles.uploadLabel}>{t('choose_image')}</Text>
              <Image source={require('../assets/icons/image-gallery.png')} style={styles.uploadIcon} />
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <Text style={styles.orText}>{t('or')}</Text>
            </View>

            <TouchableOpacity style={styles.uploadBox} onPress={pickPdf}>
              <Text style={styles.uploadLabel}>{t('choose_pdf')}</Text>
              <Image source={require('../assets/icons/pdf.png')} style={styles.uploadIcon} />
            </TouchableOpacity>
          </View>

          {fileUris.length > 0 && (
            <View style={styles.previewContainer}>
              {fileUris.map((file, index) => {
                const isPdf = file.name?.toLowerCase().endsWith('.pdf');
                return (
                  <View key={index} style={isPdf ? styles.pdfItem : styles.previewItem}>
                    {isPdf ? (
                      <View style={styles.pdfRow}>
                        <Text style={styles.pdfText}>{file.name || `PDF ${index + 1}`}</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: file.uri }} style={styles.previewImage} />
                    )}
                    <TouchableOpacity onPress={() => removeFile(file.uri)} style={styles.removeBtn}>
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { opacity: isSubmitting ? 0.5 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.saveText}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
<CustomConfirmModal
  visible={confirmVisible}
  title={confirmTitle}
  message={confirmMessage}
  onConfirm={onConfirm}
  onCancel={onCancel}
/>

<CustomAlert
  visible={alertVisible}
  title={alertTitle}
  message={alertMessage}
  onClose={() => {
    setAlertVisible(false);
    onAlertClose(); // פעולה אחרי סגירת האלרט
  }}
/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1D2B64',
    justifyContent: 'flex-end',
  },
  whiteContainer: {
    height: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  container: {
    padding: 24,
    paddingBottom: 30,
  },
 
input: {
  borderWidth: 1,
  borderColor: '#807A7A',
  borderRadius: 14,
  padding: 12,
  marginBottom: 12,
  fontFamily: 'Poppins-Regular',
  textAlign: I18nManager.isRTL ? 'right' : 'left'
},
  headerImage: {
  width: '100%',
  height: 150,
  resizeMode: 'contain',
  marginTop: 20,
  marginBottom: -20,
  alignSelf: 'center',
},
sectionTitle: {
  fontSize: 18,
  color: '#1D2B64',
  textAlign: 'left',

  marginBottom: 20,
  fontFamily: 'Poppins-Bold',
},
  saveBtn: {
    backgroundColor: '#1D2B64',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 0,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadBox: {
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FDB813',
    borderRadius: 14,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  uploadLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  uploadIcon: {
    width: 25,
    height: 25,
    tintColor: '#FDB813',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  previewItem: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pdfBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDB813',
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orContainer: {
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 8,
},

orText: {
  fontSize: 16,
 
  color: '#1b2b68',
      fontFamily: 'Poppins-Bold',
},
backButton: {
  position: 'absolute',
  top: Platform.OS === 'android' ? 20 : 20,
  left: 20,
  zIndex: 10,
},
pdfItem: {
  width: '100%',
  marginBottom: 12,
  position: 'relative',
},

pdfRow: {
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#1b2b68',
  backgroundColor: '#d9ecff',
},

pdfText: {
  color: '#333',
  fontWeight: '600',
  fontSize: 14,
},
inputWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 10,
  marginBottom: 16,
  backgroundColor: '#fff',
  height: 50,
},

inputIcon: {
  width: 20,
  height: 20,
  marginRight: 8,
  tintColor: '#999', // אופציונלי
},

inputField: {
  flex: 1,
  fontSize: 16,
  color: '#333',
  textAlign: I18nManager.isRTL ? 'right' : 'left',
  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
},
});