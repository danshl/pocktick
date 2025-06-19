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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
  const [fileUris, setFileUris] = useState<string[]>([]);

  const pickFile = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFileUris(prev => [...prev, result.assets[0].uri]);
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
      const formData = new FormData();

      formData.append('eventName', eventName);
      formData.append('seatLocation', seatLocation);
      formData.append('dateTime', dateTime);
      formData.append('additionalDetails', details || '');
      formData.append('ticketCount', ticketCount.toString());
      formData.append('buyerEmail', buyerEmail);
      formData.append('price', price.toString());
      formData.append('location', location);
      formData.append('startTime', startTime);
      formData.append('gatesOpenTime', gatesOpenTime);

      fileUris.forEach((uri, index) => {
        formData.append('ticketFiles', {
          uri,
          name: `ticket-${index + 1}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      const res = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/submit',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        Alert.alert('Success', 'Transfer submitted successfully.');
        router.back();
      } else {
        const text = await res.text();
        Alert.alert('Error', text || 'Failed to submit transfer.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.whiteContainer}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require('../assets/icons/square.png')} style={styles.icon} />
            <Text style={styles.title}>Upload & sell external ticket</Text>
          </View>
<Text style={styles.sectionTitle}>Enter Buyer Details</Text>

<TextInput
  style={styles.input}
  placeholder="Number of Tickets"
  placeholderTextColor="#807A7A"
  keyboardType="numeric"
  value={ticketCount}
  onChangeText={setTicketCount}
/>

<TextInput
  style={styles.input}
  placeholder="Event Name"
  placeholderTextColor="#807A7A"
  value={eventName}
  onChangeText={setEventName}
/>

<TextInput
  style={styles.input}
  placeholder="Seat Location"
  placeholderTextColor="#807A7A"
  value={seatLocation}
  onChangeText={setSeatLocation}
/>

<TextInput
  style={styles.input}
  placeholder="Buyer Email"
  placeholderTextColor="#807A7A"
  value={buyerEmail}
  onChangeText={setBuyerEmail}
/>

<TextInput
  style={styles.input}
  placeholder="Date & Time"
  placeholderTextColor="#807A7A"
  value={dateTime}
  onChangeText={setDateTime}
/>

<TextInput
  style={styles.input}
  placeholder="Location"
  placeholderTextColor="#807A7A"
  value={location}
  onChangeText={setLocation}
/>

<TextInput
  style={styles.input}
  placeholder="Start Time"
  placeholderTextColor="#807A7A"
  value={startTime}
  onChangeText={setStartTime}
/>

<TextInput
  style={styles.input}
  placeholder="Gates Open Time"
  placeholderTextColor="#807A7A"
  value={gatesOpenTime}
  onChangeText={setGatesOpenTime}
/>

<TextInput
  style={styles.input}
  placeholder="Price"
  placeholderTextColor="#807A7A"
  keyboardType="numeric"
  value={price}
  onChangeText={setPrice}
/>

<TextInput
  style={styles.input}
  placeholder="Additional Details"
  placeholderTextColor="#807A7A"
  multiline
  value={details}
  onChangeText={setDetails}
/>

          <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
            <Text style={styles.uploadLabel}>Upload Ticket</Text>
            <Image source={require('../assets/icons/square.png')} style={styles.uploadIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveText}>Save Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
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
    height: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
  },
  container: {
    padding: 24,
    paddingBottom: 60,
  },
  backBtn: {
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 22,
    color: '#1D2B64',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D2B64',
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  uploadBox: {
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FDB813',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 20,
  },
  uploadLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  uploadIcon: {
    width: 24,
    height: 24,
    tintColor: '#FDB813',
  },
  saveBtn: {
    backgroundColor: '#1D2B64',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cancel: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  fontFamily: 'Poppins-Bold', // ודא שהגופן מוטען
  color: '#222',              // כהה יותר
  marginBottom: 12,
  textAlign: 'left',
},
});