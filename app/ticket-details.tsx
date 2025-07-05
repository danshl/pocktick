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
  I18nManager,
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
import useTranslation from './i18n/useTranslation';
import CustomAlert from './CustomAlert';
import CustomConfirmModal from './CustomConfirmModal';


 


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
  const [isTransferring, setIsTransferring] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState('');
const [alertMessage, setAlertMessage] = useState('');
const [confirmVisible, setConfirmVisible] = useState(false);
const [confirmTitle, setConfirmTitle] = useState('');
const [confirmMessage, setConfirmMessage] = useState('');
const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});
const [onCancel, setOnCancel] = useState<() => void>(() => () => {});

  const selectedTickets = parsedTickets.filter(
    (ticket) => ticket.event.id === selectedTicket.event.id);
  const totalPrice = selectedTickets.reduce((sum, t) => sum + t.price, 0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
const { t } = useTranslation();
 useEffect(() => {
  AsyncStorage.getItem('userEmail').then(setUserEmail);
}, []);


const handleCancelTransfer = (transferId: number) => {
  setConfirmTitle(t('confirm_cancel_title')); // השתמש בתרגומים
  setConfirmMessage(t('confirm_cancel_message'));

  setOnConfirm(() => async () => {
    setConfirmVisible(false);
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
        setAlertTitle(t('success'));
        setAlertMessage(t('offer_canceled_successfully'));
        setAlertVisible(true);
        fetchUnifiedTickets(); // ← ודא שקיימת ומעודכנת
      } else {
        const text = await res.text();
        setAlertTitle(t('error'));
        setAlertMessage(text || t('error_cancel_offer'));
        setAlertVisible(true);
      }
    } catch (err) {
      console.error(err);
      setAlertTitle(t('error'));
      setAlertMessage(t('error_cancel_offer'));
      setAlertVisible(true);
    }
  });

  setOnCancel(() => () => setConfirmVisible(false));
  setConfirmVisible(true);
};


const handleBuyTransfer = (externalTransferId: number) => {
  setConfirmTitle(t('buy_tickets_title')); // למשל: "רכישת כרטיסים"
  setConfirmMessage(t('buy_tickets_message')); // למשל: "האם אתה בטוח שברצונך להשלים את הרכישה?"

  setOnConfirm(() => async () => {
  setConfirmVisible(false);
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
  if (response.ok && json.success && json.payment_page_link) {
    console.log(json.payment_page_link);
  router.push({
  pathname: '/payment',
  params: { url: json.payment_page_link },
  });
  } else {
  setAlertTitle(t('error'));
  setAlertMessage(t('payment_failed'));
  setAlertVisible(true);
  }
  } catch (error) {
  setAlertTitle(t('error'));
  setAlertMessage(t('connection_failed'));
  setAlertVisible(true);
  }
  });

  setOnCancel(() => () => setConfirmVisible(false));
  setConfirmVisible(true);
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
 

const handleCancelOffer = () => {
  setConfirmTitle(t('confirm_cancel_title'));
  setConfirmMessage(t('confirm_cancel_message'));

  setOnConfirm(() => async () => {
    setConfirmVisible(false);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!selectedTicket.transactionId) throw new Error('Missing transaction ID');

      const response = await fetch(
        `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/cancel-offer/${selectedTicket.transactionId}?token=${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Cancel failed');

      setAlertTitle(t('success'));
      setAlertMessage(t('offer_canceled_successfully'));
      setAlertVisible(true);

      const updated = await fetchUnifiedTickets();
      setTickets(updated);
      router.back();
    } catch (error) {
      console.error('❌ Cancel Error:', error);
      setAlertTitle(t('error'));
      setAlertMessage(t('error_cancel_offer'));
      setAlertVisible(true);
    }
  });

  setOnCancel(() => () => setConfirmVisible(false));
  setConfirmVisible(true);
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
  if (isTransferring) return;

  setIsTransferring(true);

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
          ticketIds: selectedTicketIds,
          buyerEmail: recipientEmail,
          price: parseFloat(price),
          comment: comments,
        }),
      }
    );

    const responseText = await response.text();
    let message = 'Transfer failed.';

    if (response.ok) {
      const updatedTickets = await fetchUnifiedTickets();
      setTickets(updatedTickets);

      setAlertTitle(t('success'));
      setAlertMessage(t('transfer_initiated'));
      setAlertVisible(true);
    } else {
      try {
        const json = JSON.parse(responseText);
        if (json?.message) message = json.message;
        else message = responseText;
      } catch {
        message = responseText;
      }
      setAlertTitle(t('error'));
      setAlertMessage(message);
      setAlertVisible(true);
    }
  } catch (error) {
    console.error('❌ Transfer Error:', error);
    setAlertTitle(t('error'));
    setAlertMessage(t('connection_error'));
    setAlertVisible(true);
  } finally {
    setIsTransferring(false);
  }
};

return (
<View style={styles.container}>
  <ScrollView contentContainerStyle={styles.contentWrapper} showsVerticalScrollIndicator={false}>
    <View style={styles.imageWrapper}>
      <Image source={{ uri: ticket.event.imageUrl }} style={styles.detailImage} />
      <LinearGradient colors={['rgba(0,0,0,0.2)', 'transparent']} style={styles.gradientOverlay} />
      <TouchableOpacity onPress={() => router.back()} style={[styles.backButton,I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}>
        <MaterialIcons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>
      <Text style={styles.eventDetailsTitle}>{t('event_details')}</Text>
    </View>

    <View style={styles.detailsRow}>
      <View style={[styles.detailItem, { flex: 1.4 }]}>
        <Text style={styles.detailLabel}>{t('date')}</Text>
        <Text style={styles.detailValue}>
          {(() => {
            const parts = ticket.event.date.split('/');
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year.slice(-2)}`;
            }
            return ticket.event.date;
          })()}
        </Text>
      </View>
      <View style={[styles.detailItem, { flex: 2 }]}>
        <Text style={styles.detailLabel}>{t('location')}</Text>
        <Text style={styles.detailValue}>{ticket.event.location}</Text>
      </View>

      <View style={[styles.detailItem, { flex: 1.5 }]}>
        <Text style={styles.detailLabel}>{t('price')}</Text>
        <Text style={styles.detailValue}>₪{totalPrice}</Text>
      </View>

      <View style={[styles.detailItem, styles.lastDetailItem, { flex: 1.4 }]}>
        <Text style={styles.detailLabel}>{t('tickets')}</Text>
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
          <Text style={styles.infoLabel}>{t('start_time')}</Text>
          <Text style={styles.infoValue}>{ticket.event.startTime}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name="gate" size={22} color="#1D2B64" />
        </View>
        <View style={styles.infoTextBlock}>
          <Text style={styles.infoLabel}>{t('gates_open')}</Text>
          <Text style={styles.infoValue}>{ticket.event.gatesOpenTime}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name="event-seat" size={22} color="#1D2B64" />
        </View>
        <View style={styles.infoTextBlock}>
          <Text style={styles.infoLabel}>{t('seats')}</Text>
          {selectedTickets.map((ticket) => (
            <Text key={ticket.id} style={styles.infoValue}>
              {`${ticket.seatDescription || `${t('ticket')} #${ticket.id}`}`}
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
          <Text style={styles.infoLabel}>{t('additional_notes')}</Text>
          <Text style={styles.infoValue}>
            {ticket.event.notes ? ticket.event.notes.replace(/\n/g, ', ') : t('no_additional_notes')}
          </Text>
        </View>
      </View>

      {ticket.status === 2 && ticket.transferSource && (
        <View style={{
          marginTop: 12,
          marginHorizontal: 12,
          padding: 10,
          backgroundColor: '#E6F0FF',
          borderRadius: 8,
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 14,
            color: '#1D2B64',
            fontWeight: '500',
            textAlign: 'center'
          }}>
{t('sold_to') + ' ' + ticket.transferSource.email + ' בעלות של ' + ' ₪' + ticket.transferSource.priceToPay + ' ' + t('on') + ' ' + ticket.transferSource.soldAt}
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
          setAlertTitle(t('coming_soon'));
          setAlertMessage(t('external_transfer_unavailable'));
          setAlertVisible(true);
          return;
        }

        setModalVisible(true);
        setShowTicketSelection(true);
        setSelectedTicketIds([]);
      }}
    >
      <Text style={styles.actionBtnText}>
        {selectedTicket.isExternal ? t('transfer_all_tickets') : t('transfer_ticket')}
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
      <Text style={styles.actionBtnText}>{t('view_qr')}</Text>
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
          <Text style={styles.actionBtnText}>{t('cancel_offer')}</Text>
        </TouchableOpacity>
        <Text style={styles.purchaseHint}>
          {t('sent_to')}: {selectedTicket.transferSource?.email}
        </Text>
        <Text style={styles.purchaseHint}>
          {t('offered_price')}: ₪{selectedTicket.transferSource?.priceToPay}
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
          <Text style={styles.actionBtnText}>{t('buy')}</Text>
        </TouchableOpacity>
        <Text style={styles.purchaseHint}>
          {t('total_offered_price')}: ₪{selectedTicket.transferSource?.priceToPay}
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
            <TouchableOpacity onPress={() => setModalVisible(false)}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image
      source={require('../assets/icons/arrow-left.png')}
      style={{
        width: 18,
        height: 18,
        marginRight: 3,
       transform: I18nManager.isRTL ? [{ rotate: '180deg' }] : [],
        tintColor: '#1D2B64',
        marginTop: Platform.OS === 'ios' ? -12 : 1, // פיצוי קטן לגובה
      }}
    />
    <Text
      style={[
        styles.backText,
        {
          paddingTop: Platform.OS === 'android' ? 1 : 0,
          lineHeight: 20,
          fontSize: 14,
          color: '#1D2B64',
          fontFamily: 'Poppins-Regular',
        },
      ]}
    >
      {t('back')}
    </Text>
  </View>
</TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{t('select_seats')}</Text>
          {parsedTickets.map((ticket) => {
  const isSelected = selectedTicketIds.includes(ticket.id);
  return (
    <TouchableOpacity
      key={ticket.id}
      style={[
        styles.ticketRow,
        isSelected && styles.ticketSelected,
      ]}
      onPress={() => {
        setSelectedTicketIds((prev) =>
          prev.includes(ticket.id)
            ? prev.filter(id => id !== ticket.id)
            : [...prev, ticket.id]
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
{ticket.seatDescription
  ? `${ticket.seatDescription} (${ticket.price}₪)`
  : `${t('ticket')} #${ticket.id} (${ticket.price}₪)`}
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
              <Text style={styles.confirmStepText}>{t('continue_next')}</Text>
              <View style={styles.arrowCircle}>
                <Image
                  source={require('../assets/icons/next_white.png')}
                  style={[styles.arrowIcon,I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => setShowTicketSelection(true)}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image
      source={require('../assets/icons/arrow-left.png')}
      style={{
        width: 18,
        height: 18,
        marginRight: 3,
       transform: I18nManager.isRTL ? [{ rotate: '180deg' }] : [],
        tintColor: '#1D2B64',
        marginTop: Platform.OS === 'ios' ? -12 : 1, // פיצוי קטן לגובה
      }}
    />
    <Text
      style={[
        styles.backText,
        {
          paddingTop: Platform.OS === 'android' ? 1 : 0,
          lineHeight: 20,
          fontSize: 14,
          color: '#1D2B64',
          fontFamily: 'Poppins-Regular',
        },
      ]}
    >
      {t('back')}
    </Text>
  </View>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('enter_buyer_details')}</Text>
<View style={styles.inputWithIcon}>
  <Image
    source={require('../assets/icons/Message.png')}
    style={styles.inputIcon}
    resizeMode="contain"
  />
  <TextInput
    placeholder={t('buyer_email')}
    value={recipientEmail}
    onChangeText={setRecipientEmail}
    style={styles.inputField}
    placeholderTextColor="#999"
  />
</View>

<View style={styles.inputWithIcon}>
  <Image
    source={require('../assets/icons/coin.png')}
    style={styles.inputIcon}
    resizeMode="contain"
  />
  <TextInput
    placeholder={t('price')}
    value={price}
    onChangeText={setPrice}
    keyboardType="numeric"
    style={styles.inputField}
    placeholderTextColor="#999"
  />
</View>

<View style={[styles.inputWithIcon, { alignItems: 'flex-start', paddingVertical: 10 }]}>
  <Image
    source={require('../assets/icons/comment.png')}
    style={[styles.inputIcon, { marginTop: 6, alignSelf: 'flex-start' }]}
    resizeMode="contain"
  />
  <TextInput
    placeholder={t('comments_optional')}
    value={comments}
    onChangeText={setComments}
    multiline
    style={[
      styles.inputField,
      {
        height: 80,
        textAlignVertical: 'top', // 👈 זה חובה לטקסט למעלה
        paddingTop: 4,            // 👈 זה מעלה עוד קצת
      },
    ]}
    placeholderTextColor="#999"
  />
</View>
          <Text style={styles.ticketCountText}>
            {t('transfer_includes')} {selectedTicket.isExternal ? selectedTicket.ticketCount : selectedTicketIds.length} {t((selectedTicket.isExternal ? selectedTicket.ticketCount : selectedTicketIds.length) !== 1 ? 'tickets' : 'ticket')}
          </Text>
          <TouchableOpacity
            style={[styles.confirmTransferBtn, isTransferring && { opacity: 0.5 }]}
            onPress={handleTransfer}
            disabled={isTransferring}
          >
            <Text style={styles.confirmTransferText}>
              {isTransferring ? t('transferring') : t('confirm_transfer')}
            </Text>
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
          <Text style={styles.qrText}>{t('show_this_code_at_event_entry')}</Text>
        </View>
      </View>
    )}
    <CustomAlert
  visible={alertVisible}
  title={alertTitle}
  message={alertMessage}
  onClose={() => {
    setAlertVisible(false);
    if (alertTitle === t('success')) {
      router.back();
    }
  }}
/>
<CustomConfirmModal
  visible={confirmVisible}
  title={confirmTitle}
  message={confirmMessage}
  onConfirm={onConfirm}
  onCancel={onCancel}
/>
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
  textAlign: 'left', 
},
infoValue: {
  fontSize: 14,
  color: '#333',
  fontFamily: 'Poppins-Regular',
  textAlign: 'left', // ✅ הוספה
},
  detailsRow: {
    marginTop: -25,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
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
    textAlign:'left',
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
     textAlign: 'left'
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
     textAlign: 'right',
  },
  backText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1D2B64',
    marginBottom: 12,
        textAlign: 'left',
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
    textAlign: 'left'
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
inputWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  paddingHorizontal: 10,
  marginBottom: 12,
},

inputIcon: {
  width: 18,
  height: 18,
  marginRight: 8,
  tintColor: '#888',
  
},

inputField: {
  flex: 1,
  fontSize: 14,
  fontFamily: 'Poppins-Regular',
  color: '#333',
  paddingVertical: 10,
  textAlign: 'right'
},
});
