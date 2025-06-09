import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './useUserData';
import { fetchTickets } from './ticketService';
import { ActivityIndicator } from 'react-native';

export default function TicketDetailsScreen() {
  const router = useRouter();
  const { ticket } = useLocalSearchParams();
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [recipientEmail, setRecipientEmail] = useState('');
  const [price, setPrice] = useState('');
  const [comments, setComments] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { tickets, setTickets } = useUserData();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('userEmail').then(setUserEmail);
  }, []);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const fetchQrUrl = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(
      `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/${selectedTicket.id}/qr`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setQrUrl(data.url);
      setQrModalVisible(true);
    } else {
      Alert.alert('Error', 'QR code not available.');
    }
  } catch (error) {
    console.error('QR Fetch Error:', error);
    Alert.alert('Error', 'Failed to fetch QR code.');
  }
};

const handleCancelOffer = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/cancel-offer/${selectedTicket.id}?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel offer');
    }

    Alert.alert('Success', 'The offer has been canceled.');
    const updated = await fetchTickets(); // תוודא שזמינה
    setTickets(updated); // כך תעדכן בכל האפליקציה

    router.back();
    // רענון הכרטיסים (רק אם יש לך את הפונקציה או דרך לעדכן את הרשימה)
    //await refreshTickets?.(); // או fetchTickets / setTickets
  } catch (error) {
    console.error('Error cancelling offer:', error);
    Alert.alert('Error', 'Something went wrong while cancelling the offer.');
  }
};

  const handleBuy = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/transfer/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: selectedTicket.id }),
      });

      const responseText = await response.text();
      if (response.ok) {
        const updatedTickets = await fetchTickets();
        setTickets(updatedTickets); 
        Alert.alert('Success', 'Ticket successfully purchased.', [
          { text: 'OK', onPress: () => router.back() }
        ]);

      } else {
        try {
          const json = JSON.parse(responseText);
          Alert.alert('Error', json.message || 'Purchase failed.');
        } catch {
          Alert.alert('Error', responseText);
        }
      }
    } catch (error) {
      console.error('❌ Buy Error:', error);
      Alert.alert('Error', 'Could not connect to server.');
    }
  };

  const handleTransfer = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/transfer/initiate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketId: selectedTicket.id,
            buyerEmail: recipientEmail,
            price: parseFloat(price),
            comment: comments,
          }),
        }
      );

      const responseText = await response.text();
      let message = 'Transfer failed.';

      if (response.ok) {
        const updatedTickets = await fetchTickets();
        setTickets(updatedTickets); 
        Alert.alert('Success', 'Transfer initiated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        try {
          const json = JSON.parse(responseText);
          if (json?.message) message = json.message;
        } catch {
          message = responseText;
        }
        Alert.alert('Error', message);
      }
    } catch (error) {
      console.error('❌ Transfer Error:', error);
      Alert.alert('Error', 'Could not connect to server.');
    }
  };

  if (!ticket) return <Text>Loading...</Text>;
  const selectedTicket = JSON.parse(ticket as string);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentWrapper} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <Image source={require('../assets/icons/back-arrow.png')} style={styles.backIcon} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.ticketCardFull}>
        <View style={styles.eventNameOverlay}>
          <Text style={styles.eventNameText}>{selectedTicket.event.name}</Text>
        </View>

          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedTicket.event.imageUrl }} style={styles.detailImage} />
            <LinearGradient colors={['rgba(255,255,255,0)', '#ffffff']} style={styles.imageFade} />
          </View>

          <View style={styles.inlineDetails}>
            <View style={styles.detailBlock}>
              <View style={styles.labelRow}>
                <MaterialIcons name="date-range" size={14} color="#777" />
                <Text style={styles.detailLabel}> DATE</Text>
              </View>
              <Text style={styles.modalDetail}>{new Date(selectedTicket.event.date).toLocaleDateString()}</Text>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.labelRow}>
                <Ionicons name="location-outline" size={14} color="#777" />
                <Text style={styles.detailLabel}> LOCATION</Text>
              </View>
              <Text style={styles.modalDetail}>{selectedTicket.event.location}</Text>
            </View>

            <View style={styles.detailBlock}>
              <View style={styles.labelRow}>
                <MaterialIcons name="attach-money" size={14} color="#777" />
                <Text style={styles.detailLabel}> PRICE</Text>
              </View>
              <Text style={styles.modalDetail}>₪{selectedTicket.price}</Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.extraInfoCard, { transform: [{ rotateY: flipped ? backInterpolate : frontInterpolate }] }]}>
          {!flipped ? (
            <View>
              <Text style={styles.extraTitle}>Details</Text>
              <Text style={styles.extraDetail}><MaterialIcons name="access-time" size={16} /> Start time: {selectedTicket.event.startTime}</Text>
              <Text style={styles.extraDetail}><MaterialCommunityIcons name="gate" size={16} /> Gates open: {selectedTicket.event.gatesOpenTime}</Text>
              <Text style={styles.extraDetail}><MaterialIcons name="event-seat" size={16} /> Seat: Section A, Row 10, Seat 5</Text>
              <Text style={styles.extraDetail}><MaterialCommunityIcons name="note-text-outline" size={16} /> {selectedTicket.event.notes ? selectedTicket.event.notes.replace(/\n/g, ', ') : 'No additional notes.'}</Text>

              {selectedTicket.transferSource && (
                <View style={{ marginTop: 24 }}>
                  <Text style={styles.extraTitle}>Seller Details</Text>
                  <Text style={styles.extraDetail}><MaterialIcons name="person-outline" size={16} /> Full Name: {selectedTicket.transferSource.fullName}</Text>
                  <Text style={styles.extraDetail}><MaterialIcons name="email" size={16} /> Email: {selectedTicket.transferSource.email}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ width: '100%' }}>
              <Text style={styles.extraTitle}>Transfer Ticket</Text>
              <TextInput placeholder="Recipient Email" value={recipientEmail} onChangeText={setRecipientEmail} style={styles.inputField} />
              <TextInput placeholder="Price (₪)" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.inputField} />
              <TextInput placeholder="Comments (optional)" value={comments} onChangeText={setComments} multiline numberOfLines={3} style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]} />
            </View>
          )}
        </Animated.View>

        <View style={styles.actionsContainer}>
          {selectedTicket.status === 0 && (!flipped ? (
            <>
              <TouchableOpacity style={styles.transferButton} onPress={flipCard}>
                <Text style={styles.transferButtonText}>Transfer Ticket</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrButton} onPress={fetchQrUrl}>
                <Text style={styles.qrButtonText}>View QR</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.cancelButton} onPress={flipCard}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleTransfer}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </>
          ))}

        {selectedTicket.status === 1 && (
          selectedTicket.transferSource === null ? (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOffer}>
              <Text style={styles.cancelButtonText}>Cancel Offer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.confirmButton} onPress={handleBuy}>
              <Text style={styles.confirmButtonText}>Buy</Text>
            </TouchableOpacity>
          )
        )}
        </View>
      </ScrollView>
{qrModalVisible && (
  <View style={styles.modalOverlay}>
    <View style={styles.qrModal}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setQrModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <View style={styles.qrCardBlue}>
        {/* Logo at the top of the blue box */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/name_white.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* QR Code inside white box */}
        <View style={styles.qrWhiteBox}>
          {qrUrl ? (
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImageSmaller}
              resizeMode="contain"
            />
          ) : (
            <ActivityIndicator size="large" color="#1D2B64" />
          )}
        </View>

      <Text style={styles.qrTextWhite}>Show this code at event entry</Text>
      </View>
    </View>
  </View>
)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  contentWrapper: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 60 },
  backButton: { position: 'absolute', left: 16, zIndex: 999, padding: 10, top: Platform.OS === 'android' ? StatusBar.currentHeight ?? 10 : 20 },
  backCircle: { width: 40, height: 40, borderRadius: 25, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 26, height: 26, resizeMode: 'contain' },
  ticketCardFull: { backgroundColor: '#fff', width: '100%', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 6, marginTop: 80 },
  imageWrapper: { position: 'relative' , width: '100%' },
  detailImage: { width: '100%', height: Dimensions.get('window').height * 0.25, resizeMode: 'cover' },
  imageFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  inlineDetails: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#fff' },
  detailBlock: { flex: 1, alignItems: 'center' },
  modalDetail: { fontSize: 13, color: '#444', textAlign: 'center' },
  extraInfoCard: { backgroundColor: 'rgba(212,212,212,0.5)', borderRadius: 24, padding: 20, width: '95%', alignSelf: 'center', elevation: 2, top: -26, zIndex: -1, backfaceVisibility: 'hidden', marginTop: 16 },
  extraContent: { paddingBottom: 30 },
  extraTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  extraDetail: { fontSize: 14, color: '#333', marginBottom: 10 },
  inputField: { backgroundColor: '#F0F0F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 8, fontSize: 14, color: '#333' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 20 },
  transferButton: { flex: 1, backgroundColor: '#1D2B64', padding: 12, borderRadius: 10, alignItems: 'center', marginRight: 10 },
  transferButtonText: { color: '#fff', fontWeight: 'bold' },
  qrButton: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, alignItems: 'center', marginLeft: 10 },
  qrButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { flex: 1, backgroundColor: '#1D2B64', padding: 12, borderRadius: 10, alignItems: 'center', marginRight: 10 },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  confirmButton: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, alignItems: 'center', marginLeft: 10 },
  confirmButtonText: { color: '#fff', fontWeight: 'bold' },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#777' },
  eventNameOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  
  eventNameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},

qrModal: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  width: 250,
  elevation: 10,
},

closeButton: {
  position: 'absolute',
  top: 5,
  right: 10,
  zIndex: 10,
},

closeButtonText: {
  fontSize: 24,
  color: '#333',
},
  qrCard: {
  backgroundColor: '#1D2B64',
  borderRadius: 20,
  padding: 24,
  alignItems: 'center',
  justifyContent: 'center',
  width: 320,
  alignSelf: 'center',
  marginTop: 40,
},

qrImage: {
  width: 260,
  height: 260,
  marginBottom: 20,
},

qrText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
qrCardBlue: {
  backgroundColor: '#1D2B64',
  borderRadius: 20,
  padding: 24,
  alignItems: 'center',
  justifyContent: 'center',
  width: 320,
  alignSelf: 'center',
  marginTop: 40,
},

qrWhiteBox: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 16,
  marginBottom: 16,
},

qrImageSmaller: {
  width: 220,
  height: 220,
},

qrTextWhite: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
logoContainer: {
  marginBottom: 12,
  alignItems: 'center',
},

logoImage: {
  width: 100,
  height: 30,
},
});
