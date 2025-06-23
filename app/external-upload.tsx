
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { submitExternalTransfer } from './api/externalTransfer';
import { MaterialIcons } from '@expo/vector-icons';

export default function ExternalUploadScreen() {
  const router = useRouter();

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
type FileItem = {
  uri: string;
  name: string;
};

const [fileUris, setFileUris] = useState<FileItem[]>([]);
const removeFile = (uriToRemove: string) => {
  setFileUris(prev => prev.filter(file => file.uri !== uriToRemove));
};

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'We need media library access to pick images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFileUris(prev => [...prev, { uri: result.assets[0].uri, name: result.assets[0].fileName || 'Image' }]);
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
        setFileUris(prev => [...prev, { uri: result.assets[0].uri, name: result.assets[0].name || 'PDF' }]);
      }
    } catch (err) {
      console.error('PDF pick error:', err);
      Alert.alert('Error picking PDF');
    }
  };

  const handleSubmit = async () => {
    if (
      !eventName ||
      !seatLocation ||
      !dateTime ||
      !ticketCount ||
      !buyerEmail ||
      !price ||
      !location ||
      !startTime ||
      !gatesOpenTime ||
      fileUris.length === 0
    ) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
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

      Alert.alert('Success', 'Transfer submitted successfully.');
      router.back();
    } catch (err: any) {
      //console.error(err);
      Alert.alert('Submission Failed', 'Please make sure all fields are filled correctly.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.whiteContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
  <MaterialIcons name="arrow-back" size={28} color="#1D2B64" />
</TouchableOpacity>
<Image
  source={require('../assets/icons/logo_full_blue.png')}
  style={styles.headerImage}
/>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>Upload & Sell External Ticket</Text>

          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Number of Tickets" value={ticketCount} onChangeText={setTicketCount} keyboardType="numeric" />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Event Name" value={eventName} onChangeText={setEventName} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Seat Location" value={seatLocation} onChangeText={setSeatLocation} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Buyer Email" value={buyerEmail} onChangeText={setBuyerEmail} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Date & Time" value={dateTime} onChangeText={setDateTime} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Location" value={location} onChangeText={setLocation} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Start Time" value={startTime} onChangeText={setStartTime} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Gates Open Time" value={gatesOpenTime} onChangeText={setGatesOpenTime} />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TextInput style={styles.input} placeholderTextColor="#B0AFAF" placeholder="Additional Details" value={details} onChangeText={setDetails} multiline />

          <Text style={styles.sectionTitle}>Upload Ticket File(s):</Text>

<View style={styles.uploadButtonsRow}>
  <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
    <Text style={styles.uploadLabel}>Choose Image(s)</Text>
    <Image source={require('../assets/icons/image-gallery.png')} style={styles.uploadIcon} />
  </TouchableOpacity>

  <View style={styles.orContainer}>
    <Text style={styles.orText}>or</Text>
  </View>

  <TouchableOpacity style={styles.uploadBox} onPress={pickPdf}>
    <Text style={styles.uploadLabel}>Choose PDF</Text>
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

          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingBottom: 60,
  },
 
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular'
  },
  headerImage: {
  width: '100%',
  height: 150,
  resizeMode: 'contain',
  marginTop: 20,
  marginBottom: 10,
  alignSelf: 'center',
},
sectionTitle: {
  fontSize: 14,
  color: '#1D2B64',

  marginBottom: 25,
  fontFamily: 'Poppins-Regular',
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
});