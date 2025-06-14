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
  <View style={styles.headerBox}>
    <Text style={styles.title}>Manual Transfers</Text>
    <Text style={styles.description}>
      Here you can view tickets transferred between users for events not supported directly by our platform.
    </Text>
  </View>

  {renderMessageByStatus()}


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
        const ticketCount = JSON.parse(transfer.ticketFilePathsJson || '[]').length;

        return (
      <View key={index} style={styles.card}>
    <View style={styles.imageWrapper}>
      <Image
        source={require('../../assets/images/Feature graphic.png')}
        style={styles.cardImage}
      />

  {/* Title inside image */}
  <Text style={styles.overlayTitle}>{transfer.eventName}</Text>

  {/* Status badge inside image */}
<View
  style={[
    styles.statusLabelWrapper,
    {
      backgroundColor: isConfirmed
        ? isBuyer
          ? '#4CAF50'   // קונה → Active (ירוק)
          : '#2196F3'   // מוכר → Transferred (כחול)
        : '#FFA500',     // Pending (כתום)
    },
  ]}
>
  <Text style={styles.statusLabelText}>
    {isConfirmed
      ? isBuyer
        ? 'Active'
        : 'Transferred'
      : 'Pending'}
  </Text>
</View>
</View>

  <View style={styles.cardContent}>
    <Text style={styles.cardTitle}>{transfer.eventName}</Text>
    <Text style={styles.cardText}>Tickets: {ticketCount}</Text>
    <Text style={styles.cardText}>Date & Time: {transfer.dateTime}</Text>
    <Text style={styles.cardText}>
      {isBuyer ? 'Seller Email' : 'Buyer Email'}: {counterparty || 'N/A'}
    </Text>
    <Text style={styles.cardText}>Seat: {transfer.seatLocation}</Text>
    <Text style={styles.cardText}>Price: ₪{transfer.price}</Text>

    {/* Buttons */}
    {!isConfirmed ? (
      <TouchableOpacity
        style={styles.cardButton}
        onPress={() =>
          isBuyer ? handleBuyTransfer(transfer.id) : handleCancelTransfer(transfer.id)
        }
      >
        <Text style={styles.cardButtonText}>
          {isBuyer ? 'Buy' : 'Cancel Transfer'}
        </Text>
      </TouchableOpacity>
    ) : isBuyer ? (
      <TouchableOpacity
        style={styles.cardButton}
        onPress={() =>
          router.push({ pathname: '/open-tickets-screen', params: { transferId: transfer.id } })
        }
      >
        <Text style={styles.cardButtonText}>Show My Tickets</Text>
      </TouchableOpacity>
    ) : (
      <View style={[styles.cardButton, { backgroundColor: '#1b2b68' }]}>
        <Text style={[styles.cardButtonText, { color: '#fff', textAlign: 'center' }]}>
           Ticket transferred. Payment will be processed after the event.
        </Text>
      </View>
    )}
  </View>
</View>
        );
      })}
    </ScrollView>

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
    <View style={styles.headerBoxModal}>
      <Image
        source={require('../../assets/images/log_ye.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
    </View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Number of Tickets</Text>
  <TextInput
    style={styles.input}
    keyboardType="numeric"
    value={ticketCount}
    onChangeText={setTicketCount}
  />
</View>
<View style={styles.inputGroup}>
  <Text style={styles.label}>Event Name</Text>
  <TextInput
    style={styles.input}
    value={eventName}
    onChangeText={setEventName}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Seat Location</Text>
  <TextInput
    style={styles.input}
    value={seatLocation}
    onChangeText={setSeatLocation}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Buyer Email</Text>
  <TextInput
    style={styles.input}
    keyboardType="email-address"
    autoCapitalize="none"
    value={buyerEmail}
    onChangeText={setBuyerEmail}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Date & Time</Text>
  <TextInput
    style={styles.input}
    value={dateTime}
    onChangeText={setDateTime}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Price (₪)</Text>
  <TextInput
    style={styles.input}
    keyboardType="numeric"
    value={price}
    onChangeText={setPrice}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Additional Details</Text>
  <TextInput
    style={[styles.input, { height: 80 }]}
    multiline
    value={details}
    onChangeText={setDetails}
  />
</View>
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
card: {
  backgroundColor: '#fff',
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 20,
  elevation: 3, // for Android shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 0,

  // ✅ קו כחול מסביב
  borderWidth: 2,
  borderColor: '#1D2B64',
},

cardImage: {
  width: '100%',
  height: 140,
  resizeMode: 'cover',
},

cardContent: {
  padding: 16,
},

cardTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 6,
},

cardText: {
  fontSize: 14,
  color: '#333',
  marginBottom: 4,
},

statusRow: {
  marginBottom: 10,
},

statusLabel: {
  color: '#fff',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  fontSize: 12,
  alignSelf: 'flex-start',
},

cardButton: {
  backgroundColor: '#1D2B64',
  paddingVertical: 10,
  paddingHorizontal: 16, 
  borderRadius: 8,
  marginTop: 10,
},

cardButtonText: {
  color: '#fff',
  textAlign: 'center',
  fontWeight: 'bold',
},
headerBox: {
  backgroundColor: '#d9ecff',
  paddingTop: 10, // מרווח מהסטטוס בר (ניתן להתאים)
  paddingBottom: 30,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 20,
},

title: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#1b2b68',
  textAlign: 'center',
  marginBottom: 5,
},

description: {
  fontSize: 14,
  color: '#1b2b68',
  textAlign: 'center',
  marginTop: 5,
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
 
  uploadButton: {
    backgroundColor: '#ffb703',
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
 overlayTitle: {
  position: 'absolute',
  top: 8,
  left: 8,
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  zIndex: 2,
  maxWidth: '65%',
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
imageWrapper: {
  position: 'relative',
},

statusLabelWrapper: {
  position: 'absolute',
  top: 8,
  right: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  zIndex: 2,
},

statusLabelText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
},
inputGroup: {
  marginBottom: 15,
},

label: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 6,
},

input: {
  height: 50,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  backgroundColor: '#fff',
},
headerImage: {
  width: '100%',
  height: 80,
  marginTop: 10,
},
headerBoxModal: {
  backgroundColor: '#1D2B64',
  paddingTop: 10,
  paddingBottom: 30,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 20,
},
});