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
import { fetchUnifiedTickets } from './ticketService';
import { ActivityIndicator } from 'react-native';
import { Ticket } from './types';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export default function TicketDetailsScreen() {
  const router = useRouter();
  const { tickets: passedTickets } = useLocalSearchParams();
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
const [lastTransactionId, setLastTransactionId] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { tickets, setTickets } = useUserData();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrUrls, setQrUrls] = useState<{ ticketId: number; url: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'qr' | 'transfer' | null>(null);

const [showTicketSelection, setShowTicketSelection] = useState(true);
const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);
const [recipientEmail, setRecipientEmail] = useState('');
const [price, setPrice] = useState('');
const [comments, setComments] = useState('');
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

const fetchQrUrls = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const ids = parsedTickets.map((t: any) => t.id);
    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/qr/batch',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ids),
      }
    );
    if (response.ok) {
      const data = await response.json(); // [{ ticketId, url }]
      setQrUrls(data); // חדש!
      setQrModalVisible(true);
    } else {
      Alert.alert('Error', 'QR codes not available.');
    }
  } catch (error) {
    console.error('QR Fetch Error:', error);
    Alert.alert('Error', 'Failed to fetch QR codes.');
  }
};

const handleCancelOffer = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    if (!selectedTicket.transactionId) {
      throw new Error('Missing transaction ID');
    }

    const response = await fetch(
      `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/cancel-offer/${selectedTicket.transactionId}?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel offer');
    }

    Alert.alert('Success', 'The offer has been canceled.');
    const updated = await fetchUnifiedTickets();
    setTickets(updated);
    router.back();
  } catch (error) {
    console.error('Error cancelling offer:', error);
    Alert.alert('Error', 'Something went wrong while cancelling the offer.');
  }
};


const handleBuy = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!selectedTicket.transactionId) {
      Alert.alert('Error', 'Missing transaction ID on ticket.');
      return;
    }
    await AsyncStorage.setItem('lastTransactionId', selectedTicket.transactionId.toString());
    await AsyncStorage.setItem('IsInternal', "true");

    const response = await fetch(
      `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/pay-plus/start-payment?transactionId=${selectedTicket.transactionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const json = await response.json();

    if (response.ok && json.success && json.payment_page_link) {
      console.log(json.payment_page_link);
      router.push({
        pathname: '/payment',
        params: { url: json.payment_page_link },
      });
    } else {
      Alert.alert('Error', 'Could not initiate payment.');
    }
  } catch (error) {
    console.error('❌ Payment Error:', error);
    Alert.alert('Error', 'Could not connect to server.');
  }
};

const handleBuy1 = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await fetch(`https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/pay-plus/start-payment?transactionId=${selectedTicket.transactionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await response.json();

  if (response.ok && json.success && json.payment_page_link) {
    console.log('Opening Safari:', json.payment_page_link);
    await WebBrowser.openBrowserAsync(json.payment_page_link); // ✅ Safari חיצוני
  } else {
    Alert.alert('Error', 'Could not initiate payment.');
  }
};
const buyold = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!selectedTicket.transactionId) {
      Alert.alert('Error', 'Missing transaction ID on ticket.');
      return;
    }

    const response = await fetch(
      `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/transfer/confirm?transactionId=${selectedTicket.transactionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseText = await response.text();
    if (response.ok) {
      const updatedTickets = await fetchUnifiedTickets();
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
      console.log(selectedTicket.id);
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
            ticketIds: selectedTicketIds,
            buyerEmail: recipientEmail,
            price: parseFloat(price),
            comment: comments,
          }),
        }
      );
      console.log(selectedTicket.id,recipientEmail,parseFloat(price),comments);
      const responseText = await response.text();
      let message = 'Transfer failed.';

      if (response.ok) {
        const updatedTickets = await fetchUnifiedTickets();
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

  if (!passedTickets) return <Text>Loading...</Text>;
  const parsedTickets: Ticket[] = JSON.parse(passedTickets as string);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const selectedTicket = parsedTickets[selectedTicketIndex];
const selectedTickets = parsedTickets.filter(
  (ticket) => ticket.event.id === selectedTicket.event.id
);

console.log("dd",selectedTicket.transactionId);
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

              <Text style={styles.detailLabel}> DATE</Text>
            </View>
            <Text style={styles.modalDetail}>
              {new Date(selectedTicket.event.date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailBlock}>
            <View style={styles.labelRow}>

              <Text style={styles.detailLabel}> LOCATION</Text>
            </View>
            <Text style={styles.modalDetail}>{selectedTicket.event.location}</Text>
          </View>

          <View style={styles.detailBlock}>
            <View style={styles.labelRow}>

              <Text style={styles.detailLabel}> PRICE</Text>
            </View>
            <Text style={styles.modalDetail}>
              {parsedTickets.length > 1 ? 'Multiple' : `₪${selectedTicket.price}`}
            </Text>
          </View>

          <View style={styles.detailBlock}>
            <View style={styles.labelRow}>

              <Text style={styles.detailLabel}> TICKETS</Text>
            </View>
            <Text style={styles.modalDetail}>{parsedTickets.length}</Text>
          </View>
        </View>
        </View>

        <Animated.View style={[styles.extraInfoCard, { transform: [{ rotateY: flipped ? backInterpolate : frontInterpolate }] }]}>
          {!flipped ? (
            <View>
              <Text style={styles.extraTitle}>Details</Text>
              <Text style={styles.extraDetail}><MaterialIcons name="access-time" size={16} /> Start time: {selectedTicket.event.startTime}</Text>
              <Text style={styles.extraDetail}><MaterialCommunityIcons name="gate" size={16} /> Gates open: {selectedTicket.event.gatesOpenTime}</Text>
              <Text style={styles.extraDetail}>
                <MaterialIcons name="event-seat" size={16} /> Seats:
              </Text>
              {selectedTickets.map((ticket) => (
                <Text key={ticket.id} style={styles.extraDetail}>
                  • {ticket.seatDescription || 'N/A'}
                </Text>
              ))}

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
            <TouchableOpacity
              style={styles.transferButton}
              onPress={() => {
                setModalMode('transfer');
                setModalVisible(true);
              }}
            >
              <Text style={styles.transferButtonText}>Transfer Ticket</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => {
                fetchQrUrls(); // משאיר את זה אם אתה עדיין צריך למשוך את ה-QR מהשרת
                setModalMode('qr');
                setModalVisible(true);
              }}
            >
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
      {modalVisible && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          {modalMode === 'qr' ? (
            // תצוגת QR
            <View style={styles.qrModal}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setModalMode(null);
                }}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              <View style={styles.qrCardBlue}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../assets/images/name_white.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.qrWhiteBox}>
                  {qrUrls.length === 0 ? (
                    <ActivityIndicator size="large" color="#1D2B64" />
                  ) : (
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ alignItems: 'center' }}
                      onScroll={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / 260);
                        setActiveIndex(qrUrls.length - 1 - index);
                      }}
                      scrollEventThrottle={16}
                    >
                      {qrUrls.map(({ ticketId, url }) => (
                        <View key={ticketId} style={{ width: 260, alignItems: 'center' }}>
                          <Image
                            source={{ uri: url }}
                            style={{ width: 220, height: 220 }}
                            resizeMode="contain"
                          />
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.indicatorContainer}>
                  {qrUrls.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicatorDot,
                        activeIndex === index && styles.indicatorDotActive,
                      ]}
                    />
                  ))}
                </View>

                <Text style={styles.qrTextWhite}>Show this code at event entry</Text>
              </View>
            </View>
          ) : (
            // תצוגת העברת כרטיסים
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              width: '92%',
              padding: 24,
              maxHeight: '90%',
            }}>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  style={[styles.closeButton, { top: 10, right: 10 }]}
                  onPress={() => {
                    setModalVisible(false);
                    setModalMode(null);
                    setSelectedTicketIds([]);
                    setRecipientEmail('');
                    setPrice('');
                    setComments('');
                    setShowTicketSelection(true);
                  }}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                {!showTicketSelection && (
                  <TouchableOpacity
                    onPress={() => setShowTicketSelection(true)}
                    style={{
                      position: 'absolute',
                      top: 18,
                      left: 18,
                      zIndex: 2,
                    }}
                  >
                    <Ionicons name="arrow-back" size={20} color="#1D2B64" />
                  </TouchableOpacity>
                )}
                <Image
                  source={require('../assets/images/name.png')}
                  style={{
                    width: 130,
                    height: 38,
                    resizeMode: 'contain',
                    marginTop: 50,
                    marginBottom: 20,
                    alignSelf: 'center',
                  }}
                />

                {showTicketSelection ? (
                  <>
                    <Text style={[styles.extraTitle, { marginBottom: 16 }]}>Select Tickets to Transfer</Text>

                    {parsedTickets.map((ticket) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => {
                        setSelectedTicketIds((prev) =>
                          prev.includes(ticket.id)
                            ? prev.filter((id) => id !== ticket.id)
                            : [...prev, ticket.id]
                        );
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 14,
                        marginBottom: 12,
                        borderRadius: 12,
                        backgroundColor: selectedTicketIds.includes(ticket.id) ? '#D0E8FF' : '#F0F0F0',
                      }}
                    >
                      <Ionicons
                        name={selectedTicketIds.includes(ticket.id) ? 'checkbox-outline' : 'square-outline'}
                        size={22}
                        color="#1D2B64"
                        style={{ marginRight: 10 }}
                      />
                      <Text style={{ fontSize: 15, color: '#333' }}>
                        {ticket.event.name} - {ticket.seatDescription || `Ticket #${ticket.id}`} 
                      </Text>
                    </TouchableOpacity>
                  ))}

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#4CAF50',
                        paddingVertical: 12,
                        borderRadius: 10,
                        marginTop: 16,
                        width: '100%',
                        alignSelf: 'center',
                      }}
                      onPress={() => {
                        if (selectedTicketIds.length > 0) {
                          setShowTicketSelection(false);
                        } else {
                          Alert.alert('Please select at least one ticket.');
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Continue</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>

                    <Text style={[styles.extraTitle, { marginBottom: 16 }]}>Enter Buyer Details</Text>

                    <TextInput
                      placeholder="Buyer Email"
                      value={recipientEmail}
                      onChangeText={setRecipientEmail}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        padding: 10,
                      }}
                      placeholderTextColor="#888"
                    />

                    <TextInput
                      placeholder="Price (₪)"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        padding: 10,
                      }}
                      placeholderTextColor="#888"
                    />

                    <TextInput
                      placeholder="Comments (optional)"
                      value={comments}
                      onChangeText={setComments}
                      multiline
                      numberOfLines={3}
                      style={{
                        width: '100%',
                        height: 80,
                        textAlignVertical: 'top',
                        textAlign: 'left',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 12,
                      }}
                      placeholderTextColor="#888"
                    />


                    {/* טקסט המציין כמה כרטיסים מועברים */}
                    <Text style={{ alignSelf: 'flex-start', fontSize: 14, color: '#555', marginBottom: 20 }}>
                      This transfer includes {selectedTicketIds.length} ticket{selectedTicketIds.length !== 1 ? 's' : ''}
                    </Text>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#4CAF50',
                        paddingVertical: 12,
                        borderRadius: 10,
                        marginTop: 10,
                        width: '100%',
                        alignSelf: 'center',
                      }}
                      onPress={handleTransfer}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Confirm Transfer</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          )}
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
    ticketCardFull: {
  width: '100%',
  overflow: 'hidden', // שמור
  backgroundColor: '#fff',
  marginTop: 80,
  shadowColor: 'transparent',
  elevation: 0,
  borderWidth: 0,
  borderRadius: 24,
},  imageWrapper: {
  width: '100%',
  height: Dimensions.get('window').height * 0.25,
  overflow: 'hidden',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  backgroundColor: '#fff', 
},

detailImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},
 imageFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  inlineDetails: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#fff' },
  detailBlock: { flex: 1, alignItems: 'center' },
  modalDetail: { fontSize: 13, color: '#444', textAlign: 'center' },
  extraInfoCard: {
  backgroundColor: '#E5E5E5', // ✅ אפור חלק ויפה
  borderRadius: 24,
  padding: 20,
  width: '95%',
  alignSelf: 'center',
  elevation: 2,
  top: -26,
  zIndex: -1,
  backfaceVisibility: 'hidden',
  marginTop: 16,
},  extraContent: { paddingBottom: 30 },
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
  detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#1D2B64', },
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
  backgroundColor: 'rgba(0,0,0,0.7)',
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
  marginTop: 30,
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
  borderRadius: 16,
  marginBottom: 16,
  paddingVertical: 20,
  alignItems: 'center',
  justifyContent: 'center',
  width: 260, // ✅ גבול קבוע
  height: 260,
  overflow: 'hidden', // ✅ מונע חריגה
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
indicatorContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
},
indicatorDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#ccc',
  marginHorizontal: 4,
  marginBottom: 16,
},
indicatorDotActive: {
  backgroundColor: '#000',
},
});
