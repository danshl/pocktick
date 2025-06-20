// TicketDetailsScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Ticket } from './types';
import { fetchUnifiedTickets } from './ticketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserData } from './useUserData';
import Modal from 'react-native-modal';

export default function TicketDetailsScreen() {
  const { tickets: passedTickets } = useLocalSearchParams();
  const router = useRouter();
  const parsedTickets: Ticket[] = JSON.parse(passedTickets as string);
  const ticket = parsedTickets[0];
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTicketSelection, setShowTicketSelection] = useState(true);
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [price, setPrice] = useState('');
  const { tickets, setTickets } = useUserData();
  const [comments, setComments] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qrUrls, setQrUrls] = useState<{ ticketId: number; url: string }[]>([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const selectedTicket = parsedTickets[selectedTicketIndex];
  const selectedTickets = parsedTickets.filter(
    (ticket) => ticket.event.id === selectedTicket.event.id);
  const totalPrice = selectedTickets.reduce((sum, t) => sum + t.price, 0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

 useEffect(() => {
  AsyncStorage.getItem('userEmail').then(setUserEmail);
}, []);

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
              fetchUnifiedTickets(); // ← ודא שהפונקציה קיימת
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

const handleBuyTransfer = (externalTransferId: number) => {

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
            const response = await fetch(
              `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/start-external-payment?externalTransferId=${externalTransferId}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          await AsyncStorage.setItem('lastTransactionId', externalTransferId.toString());
          await AsyncStorage.setItem('IsInternal', "false");
          
          const json = await response.json();
          console.log(json);
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
          //console.error('❌ Payment Error:', error);
          Alert.alert('Error', 'Could not connect to server. Try later');
        }
        },
      },
    ]
  );
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
      const data = await response.json(); 
      setQrUrls(data);  
      console.log(data);
      setQrModalVisible(true);
    } else {
      Alert.alert('Error', 'QR codes not available.');
    }
  } catch (error) {
    console.error('QR Fetch Error:', error);
    Alert.alert('Error', 'Failed to fetch QR codes.');
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
    console.log("ddd",selectedTicket.transactionId);
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
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
const handleTransfer = async () => {
  try {
    console.log(selectedTicketIds);
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

    console.log(selectedTicket.id, recipientEmail, parseFloat(price), comments);

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

return (
  <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.contentWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: ticket.event.imageUrl }} style={styles.detailImage} />
        <LinearGradient colors={['rgba(0,0,0,0.2)', 'transparent']} style={styles.gradientOverlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.eventDetailsTitle}>Event Details</Text>
      </View>

      <View style={styles.detailsRow}>
      <View style={[styles.detailItem, { flex: 1.4 }]}>
        <Text style={styles.detailLabel}>Date</Text>
        <Text style={styles.detailValue}>
          {(() => {
            const parts = ticket.event.date.split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year.slice(-2)}`;
            }
            return ticket.event.date; // fallback
          })()}
        </Text>
      </View>
        <View style={[styles.detailItem, { flex: 2 }]}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{ticket.event.location}</Text>
        </View>

        <View style={[styles.detailItem, { flex: 1.5 }]}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>₪{totalPrice}</Text>
        </View>

        <View style={[styles.detailItem, styles.lastDetailItem, { flex: 1.4 }]}>
          <Text style={styles.detailLabel}>Tickets</Text>
          <Text style={styles.detailValue}>
            {selectedTickets?.[0]?.isExternal
              ? selectedTickets[0].ticketCount
              : selectedTickets.length}
          </Text>
        </View>
      </View>

      <Text style={styles.eventName}>{ticket.event.name}</Text>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="clock-outline" size={22} color="#1D2B64" />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoLabel}>Start Time</Text>
            <Text style={styles.infoValue}>{ticket.event.startTime}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="gate" size={22} color="#1D2B64" />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoLabel}>Gates Open</Text>
            <Text style={styles.infoValue}>{ticket.event.gatesOpenTime}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="event-seat" size={22} color="#1D2B64" />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoLabel}>Seats</Text>
            {selectedTickets.map((ticket) => (
              <Text key={ticket.id} style={styles.infoValue}>
                {`${ticket.seatDescription || `Ticket #${ticket.id}`}`}
                {!ticket.isExternal ? ` — ${ticket.price} ₪` : ''}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="note-text-outline" size={22} color="#1D2B64" />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoLabel}>Additional Notes</Text>
            <Text style={styles.infoValue}>
              {ticket.event.notes ? ticket.event.notes.replace(/\n/g, ', ') : 'No additional notes.'}
            </Text>
          </View>
        </View>
        {ticket.status === 2 && ticket.transferSource && (
          <View style={{ 
            marginTop: 12, 
            marginHorizontal: 12, 
            padding: 10, 
            backgroundColor: '#E6F0FF', // רקע תכלת בהיר
            borderRadius: 8, 
            alignItems: 'center' 
          }}>
            <Text style={{ 
              fontSize: 14, 
              color: '#1D2B64', // כחול כהה
              fontWeight: '500', 
              textAlign: 'center' 
            }}>
              This tickets were sold to {ticket.transferSource.email} for ₪{ticket.transferSource.priceToPay} on {ticket.transferSource.soldAt}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
{selectedTicket.status === 0 && (
  <>
    <TouchableOpacity
      style={[styles.actionBtn, styles.transferBtn]}
      onPress={() => {
        if (selectedTicket.isExternal) {
          Alert.alert(
            'Coming Soon',
            'Soon you’ll be able to transfer this external ticket again.\nFor now, this option is unavailable.',
            [{ text: 'OK' }]
          );
          return;
        }

        setModalVisible(true);
        setShowTicketSelection(true);
        setSelectedTicketIds([]);
      }}
    >
      <Text style={styles.actionBtnText}>
        {selectedTicket.isExternal ? 'Transfer All Tickets' : 'Transfer Ticket'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionBtn, styles.qrBtn]}
      onPress={() => {
        if (selectedTicket.isExternal) {
          router.push({
            pathname: '/open-tickets-screen',
            params: { transferId: selectedTicket.id.toString() },
          });
        } else {
          fetchQrUrls();
        }
      }}
    >
      <Text style={styles.actionBtnText}>View QR</Text>
    </TouchableOpacity>
  </>
)}

  {selectedTicket.status === 1 && (
  <View style={{ width: '100%' }}>
    {selectedTicket.transferSource?.role === 'Buyer' ? (
      <>
        <TouchableOpacity
          style={[styles.actionBtn, styles.transferBtn, { width: '100%' }]}
          onPress={() => {
            if (selectedTicket.isExternal) {
              handleCancelTransfer(selectedTicket.id);
            } else {
              handleCancelOffer();
            }
          }}
        >
          <Text style={styles.actionBtnText}>Cancel Offer</Text>
        </TouchableOpacity>
        <Text style={styles.purchaseHint}>
          Sent to: {selectedTicket.transferSource?.email}
        </Text>
        <Text style={styles.purchaseHint}>
          Offered price: ₪{selectedTicket.transferSource?.priceToPay}
        </Text>
      </>
    ) : (
      <>
        <TouchableOpacity
          style={[styles.actionBtn, styles.qrBtn, { width: '100%' }]}
          onPress={() => {
            const ticket = selectedTickets[0];
            if (ticket.isExternal) {
              handleBuyTransfer(ticket.id);
            } else {
              handleBuy();
            }
          }}
        >
          <Text style={styles.actionBtnText}>Buy</Text>
        </TouchableOpacity>
        <Text style={styles.purchaseHint}>
          Total offered price: ₪{selectedTicket.transferSource?.priceToPay}
        </Text>
      </>
    )}
  </View>
)}
      </View>
    </ScrollView>

    {modalVisible && (
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          {showTicketSelection ? (
            <>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Select Seats</Text>
              {parsedTickets.map((t) => {
                const isSelected = selectedTicketIds.includes(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.ticketRow,
                      isSelected && styles.ticketSelected,
                    ]}
                    onPress={() => {
                      setSelectedTicketIds((prev) =>
                        prev.includes(t.id)
                          ? prev.filter(id => id !== t.id)
                          : [...prev, t.id]
                      );
                    }}
                  >
                    <View style={styles.seatIconWrapper}>
                      <Image
                        source={require('../assets/icons/seat.png')}
                        style={styles.seatIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.seatText}>
                      {(t.seatDescription || `Ticket #${t.id}`) + ` (${t.price}₪)`}
                    </Text>
                    <View style={[styles.selectionCircle, isSelected ? styles.selected : styles.unselected]}>
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.confirmStepBtn}
                onPress={() => {
                  if (selectedTicketIds.length > 0) setShowTicketSelection(false);
                }}
              >
                <View style={styles.continueContent}>
                  <Text style={styles.confirmStepText}>Continue</Text>
                  <View style={styles.arrowCircle}>
                    <Image
                      source={require('../assets/icons/next_white.png')}
                      style={styles.arrowIcon}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setShowTicketSelection(true)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Enter Buyer Details</Text>
              <TextInput
                placeholder="Buyer Email"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                style={styles.input}
              />
              <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Comments (optional)"
                value={comments}
                onChangeText={setComments}
                multiline
                style={[styles.input, { height: 80 }]}
              />
              <Text style={styles.ticketCountText}>
                This transfer includes{' '}
                {selectedTicket.isExternal
                  ? selectedTicket.ticketCount
                  : selectedTicketIds.length}{' '}
                ticket{(selectedTicket.isExternal ? selectedTicket.ticketCount : selectedTicketIds.length) !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity style={styles.confirmTransferBtn} onPress={handleTransfer}>
                <Text style={styles.confirmTransferText}>Confirm Transfer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    )}

    {qrModalVisible && (
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={styles.qrCard}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 10, right: 12, zIndex: 1 }}
            onPress={() => setQrModalVisible(false)}
          >
            <Text style={{ fontSize: 28, color: '#1b2b68', right: 8, bottom: 5 }}>×</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/icons/logo_full_blue.png')}
            style={{
              width: 280,
              height: 50,
              resizeMode: 'contain',
              marginBottom: -5,
              right: 6,
              alignSelf: 'center',
            }}
          />
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const width = Dimensions.get('window').width - 48;
              const index = Math.round(x / width);
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {qrUrls.map(({ ticketId, url }) => (
              <View
                key={ticketId}
                style={{
                  width: Dimensions.get('window').width - 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 24,
                }}
              >
                <Image
                  source={{ uri: url }}
                  style={{ width: 220, height: 220 }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            {qrUrls.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 5,
                  backgroundColor: currentIndex === index ? '#1D2B64' : '#ccc',
                }}
              />
            ))}
          </View>
          <Text style={styles.qrText}>Show this code at event entry</Text>
        </View>
      </View>
    )}
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentWrapper: { paddingBottom: 40 },
  imageWrapper: {
    width: '100%',
    height: Dimensions.get('window').height * 0.3,
    position: 'relative',
  },
  detailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gradientOverlay: { position: 'absolute', width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 50,
    left: 20,
  },
  eventDetailsTitle: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 72 : 52,
    left: 60,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  detailLabel: {
    color: '#1D2B64',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  detailValue: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: 80,
  },
  infoLabel: {
    fontSize: 15,
    color: '#1D2B64',
    fontFamily: 'Poppins-Bold',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  detailsRow: {
    marginTop: -25,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  detailBox: { alignItems: 'center' },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D2B64',
    marginTop: 16,
    marginHorizontal: 20,
    fontFamily: 'Poppins-Bold',
  },
  infoSection: { marginTop: 20, paddingHorizontal: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  iconWrapper: {
    backgroundColor: '#EEF0FF',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  infoTextBlock: { flex: 1 },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#D6D6E3',
    flex: 1,
  },
  lastDetailItem: {
    borderRightWidth: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferBtn: {
    backgroundColor: '#ffb703',
  },
  qrBtn: {
    backgroundColor: '#1b2b68',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '90%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
    marginBottom: 20,
  },
  ticketOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F8',
    marginBottom: 10,
  },
  ticketText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
    color: '#333',
  },
  backText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1D2B64',
    marginBottom: 12,
  },
  ticketCountText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#1D2B64',
    marginBottom: 20,
    textAlign: 'left',
  },
  confirmTransferBtn: {
    backgroundColor: '#1D2B64',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmTransferText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  bottomSheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: '85%',
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmStepBtn: {
    backgroundColor: '#1D2B64',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  confirmStepText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginRight: 12,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F3F4F8',
    marginBottom: 10,
  },
  ticketSelected: {
    backgroundColor: '#DCE8FF',
  },
  seatIconWrapper: {
    width: 28,
    height: 28,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatIcon: {
    width: 24,
    height: 24,
  },
  seatText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1D2B64',
  },
  checkCircle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 22,
    height: 22,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  selected: {
    backgroundColor: '#FDB813',
    borderColor: '#FDB813',
  },
  unselected: {
    backgroundColor: '#E2E2E2',
    borderColor: '#D9D9D9',
  },
  checkMark: {
    color: '#1b2b68',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    marginTop: 60,
  },
  qrText: {
    color: '#1D2B64',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    marginTop: 10,
    textAlign: 'center',
  },
  purchaseHint: {
  marginTop: 8,
  fontSize: 14,
  color: '#1D2B64',
  fontFamily: 'Poppins-Regular',
  textAlign: 'center',
},
});
