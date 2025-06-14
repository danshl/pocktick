// app/external-transfers.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ExternalTransfersScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [ticketCount, setTicketCount] = useState('');
  const [eventName, setEventName] = useState('');
  const [seatLocation, setSeatLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [details, setDetails] = useState('');
  const [fileUris, setFileUris] = useState<string[]>([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [transfers, setTransfers] = useState<any[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
const [price, setPrice] = useState('');
const [refreshing, setRefreshing] = useState(false);
const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
const [sellerStatus, setSellerStatus] = useState('');

const resetForm = () => {
  setTicketCount('');
  setEventName('');
  setSeatLocation('');
  setDateTime('');
  setDetails('');
  setFileUris([]);
  setModalVisible(false);
};

const checkSellerVerification = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/sellerverification/status', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const result = await res.json();
      const status = result.status?.toLowerCase() || '';
      console.log("Seller status:", status);
      setSellerStatus(status);
      setIsVerifiedSeller(status === 'approved');
    } else {
      setSellerStatus('not_submitted');
      setIsVerifiedSeller(false);
    }
  } catch (err) {
    console.error('Verification check failed:', err);
    setSellerStatus('not_submitted');
    setIsVerifiedSeller(false);
  }
};
const renderMessageByStatus = () => {
  if (sellerStatus === 'approved') return null;

  let message = '';
  if (sellerStatus === 'rejected') {
    message = 'Your verification request was rejected. Please re-submit your documents.';
  } else if (sellerStatus === 'submitted' || sellerStatus === 'inreview') {
    message = 'Your verification is under review. Please wait for approval.';
  } else {
    message = 'You have not submitted seller verification. Please complete the process.';
  }

  return (
    <View style={{ backgroundColor: '#fff3cd', padding: 10, borderRadius: 8, marginBottom: 15 }}>
      <Text style={{ color: '#856404', textAlign: 'center' }}>{message}</Text>
    </View>
  );
};
const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([
    fetchExternalTransfers(),
    checkSellerVerification()
  ]);
  setRefreshing(false);
};

const handleBuyTransfer = (transferId: number) => {
  Alert.alert(
    'Buy Tickets',
    'Are you sure you want to complete this purchase?',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(
              `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/buy/${transferId}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (res.ok) {
              Alert.alert('Success', 'Purchase confirmed.');
              fetchExternalTransfers(); // מרענן את הרשימה
            } else {
              const errorText = await res.text();
              Alert.alert('Error', errorText || 'Failed to complete purchase.');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An error occurred.');
          }
        },
      },
    ]
  );
};

useFocusEffect(
  useCallback(() => {
    const loadEverything = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      setCurrentEmail(email || '');
      await fetchExternalTransfers();
      await checkSellerVerification();
    };

    loadEverything();
  }, [])
);

const handleCancelTransfer = (transferId: number) => {
  Alert.alert(
    'Cancel Transfer',
    'Are you sure you want to cancel this transfer?',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(
              `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/cancel/${transferId}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (res.ok) {
              Alert.alert('Success', 'Transfer cancelled successfully.');
              fetchExternalTransfers(); // ← ודא שהפונקציה קיימת
            } else {
              const text = await res.text();
              Alert.alert('Error', text || 'Failed to cancel transfer.');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An error occurred while cancelling the transfer.');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

const fetchExternalTransfers = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/my-transfers', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
           console.log("ss2",data);
      setTransfers(data); // נניח שאתה מאחסן את זה בסטייט
    } else {
      const msg = await res.text();
 
      Alert.alert('Error', msg || 'Failed to load transfers');
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Something went wrong.');
  }
};


const pickFile = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0) {
    const newUri = result.assets[0].uri;
    setFileUris(prev => [...prev, newUri]);
  }
};

const handleSubmit = async () => {
  if (!eventName || !seatLocation || !dateTime || !ticketCount || fileUris.length === 0) {
    Alert.alert('Missing Fields', 'Please fill in all required fields.');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('eventName', eventName);
    formData.append('seatLocation', seatLocation);
    formData.append('dateTime', dateTime);
    formData.append('additionalDetails', details);
    formData.append('ticketCount', ticketCount);
    formData.append('buyerEmail', buyerEmail);
    formData.append('price', price);

    fileUris.forEach((uri, index) => {
      formData.append('ticketFiles', {
        uri,
        name: `ticket-${index + 1}.jpg`,
        type: 'image/jpeg',
      } as any);
    });

    const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      Alert.alert('Success', 'Transfer submitted successfully.');
      setModalVisible(false);
      setTicketCount('');
      setEventName('');
      setSeatLocation('');
      setDateTime('');
      setDetails('');
      setBuyerEmail('');
      setFileUris([]);
      await fetchExternalTransfers();
    } else if (res.status === 401) {
      Alert.alert('Unauthorized', 'Your session has expired. Please log in again.');
    } else {
      const text = await res.text(); // might be plain text error
 
      Alert.alert('Error', text || 'Failed to submit transfer.');
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'An unexpected error occurred.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Transfers</Text>
      {renderMessageByStatus()}
      <Text style={styles.description}>
        Here you can view tickets transferred between users for events not supported directly by our platform.
      </Text>
      <ScrollView
  style={{ flex: 1 }}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>

{transfers.map((transfer, index) => {
  const isBuyer = transfer.buyerEmail?.toLowerCase() === currentEmail.toLowerCase();
  const counterparty = isBuyer ? transfer.sellerEmail : transfer.buyerEmail;
  const isConfirmed = transfer.isConfirmed === true;

return (
  <View key={index} style={styles.card}>
    {/* Label: Active / Pending */}
    <View style={styles.statusRow}>
      <Text style={[styles.statusLabel, { backgroundColor: isConfirmed ? '#4CAF50' : '#FFA500' }]}>
        {isConfirmed ? 'Active' : 'Pending'}
      </Text>
    </View>

    <Text style={styles.cardTitle}>{transfer.eventName}</Text>
    <Text style={styles.cardText}>
      Tickets number: {JSON.parse(transfer.ticketFilePathsJson || '[]').length}
    </Text>
    <Text style={styles.cardText}>Date & Time: {transfer.dateTime}</Text>
    <Text style={styles.cardText}>
      {isBuyer ? 'Seller Email' : 'Buyer Email'}: {counterparty || 'N/A'}
    </Text>
    <Text style={styles.cardText}>Seat: {transfer.seatLocation}</Text>
    <Text style={styles.cardText}>Price: ₪{transfer.price}</Text>

    {/* Conditional action buttons */}
    {!isConfirmed ? (
      <TouchableOpacity
        style={styles.cardButton}
        onPress={() => {
          if (isBuyer) {
            handleBuyTransfer(transfer.id);
          } else {
            handleCancelTransfer(transfer.id);
          }
        }}
      >
        <Text style={styles.cardButtonText}>
          {isBuyer ? 'Buy' : 'Cancel Transfer'}
        </Text>
      </TouchableOpacity>
    ) : isBuyer ? (
      <TouchableOpacity
        style={styles.cardButton}
        onPress={() => {
          router.push({ pathname: '/open-tickets-screen', params: { transferId: transfer.id } });
        }}
      >
        <Text style={styles.cardButtonText}>Show My Tickets</Text>
      </TouchableOpacity>
    ) : (
      <View style={[styles.cardButton, { backgroundColor: '#1b2b68' }]}>
        <Text
          style={[
            styles.cardButtonText,
            { color: '#fff', textAlign: 'center', flexWrap: 'wrap' },
          ]}
        >
          Ticket transferred. Payment will be processed after the event.
        </Text>
      </View>
    )}
  </View>
);
})}</ScrollView>
      {isVerifiedSeller ? (
  <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
    <Ionicons name="add" size={28} color="#fff" />
  </TouchableOpacity>
) : (
  <>
    <Text style={styles.warningText}>
      You must complete seller verification to manually transfer tickets.
    </Text>
    <TouchableOpacity style={[styles.fabDisabled]} disabled={true}>
      <Ionicons name="lock-closed" size={28} color="#fff" />
    </TouchableOpacity>
  </>
)}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Manual Transfer</Text>

          <TextInput
            style={styles.input}
            placeholder="Number of Tickets"
            keyboardType="numeric"
            value={ticketCount}
            onChangeText={setTicketCount}
          />
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            value={eventName}
            onChangeText={setEventName}
          />
          <TextInput
            style={styles.input}
            placeholder="Seat Location"
            value={seatLocation}
            onChangeText={setSeatLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Buyer Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={buyerEmail}
            onChangeText={setBuyerEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Date & Time"
            value={dateTime}
            onChangeText={setDateTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Price (₪)"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Additional Details"
            value={details}
            multiline
            onChangeText={setDetails}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
            <Text style={styles.uploadButtonText}>
              {fileUris.length > 0 ? `Uploaded ${fileUris.length} File(s) ✔️` : 'Upload Ticket File'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>Save Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: '#1D2B64',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  modalContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#333',
  },
  previewImage: {
    height: 150,
    marginBottom: 15,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#1D2B64',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    textAlign: 'center',
    color: '#888',
    textDecorationLine: 'underline',
  },
 
card: {
  backgroundColor: '#f1f5ff',
  borderColor: '#1D2B64',
  borderWidth: 2,
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
},

cardTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1D2B64',
  marginBottom: 12,
  textAlign: 'left',
},

cardText: {
  fontSize: 14,
  color: '#333',
  marginBottom: 4,
  lineHeight: 20,
},

cardButton: {
  marginTop: 12,
  backgroundColor: '#1D2B64',
  paddingVertical: 10,
  borderRadius: 6,
  alignItems: 'center',
},

cardButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
},
statusRow: {
  position: 'absolute',
  top: 10,
  right: 10,
},

statusLabel: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
  overflow: 'hidden',
  textTransform: 'uppercase',
},
warningText: {
  textAlign: 'center',
  color: '#c00',
  fontWeight: 'bold',
  marginTop: 20,
  marginBottom: 10,
  paddingHorizontal: 10,
  fontSize: 14,
},

fabDisabled: {
  position: 'absolute',
  right: 25,
  bottom: Platform.OS === 'ios' ? 90 : 70,
  backgroundColor: '#aaa',
  width: 56,
  height: 56,
  borderRadius: 28,
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.7,
},
});