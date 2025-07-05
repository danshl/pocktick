// טאב שמכיל את שלושת השלבים - בחירת אירוע, בחירת מושבים, מילוי פרטים
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform, View, TouchableOpacity, StyleSheet, Image, Text,
  Modal, ScrollView, TextInput, Alert,
  I18nManager,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../CustomAlert';
import { getSellerVerificationStatus } from '../api/sellerApi';
import { getCachedTickets } from '../ticketsCache';
import { Ticket } from '../types';
import { initiateTicketTransfer } from '../api/transferApi';
import useTranslation from '../i18n/useTranslation';
 
export default function TabLayout() {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [step, setStep] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Ticket['event'] | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [price, setPrice] = useState('');
  const [comments, setComments] = useState('');

  const { t, language } = useTranslation();

  const handleExternalUpload = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const status = await getSellerVerificationStatus(token || '');
      if (status === 'approved') {
        setShowOptions(false);
        router.push('/external-upload');
      } else {
        setAlertMessage(t('verifyAccountToSell'));
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
          router.push('/verify-seller');
        }, 3000);
      }
    } catch (err) {
      console.error('Verification API error:', err);
      setAlertMessage(t('serverError'));
      setAlertVisible(true);
    }
  };

  const allTickets = getCachedTickets();
  const availableTickets = allTickets.filter((t) => t.status === 0 && !t.isExternal);
  const uniqueEvents = Array.from(new Map(availableTickets.map((t) => [t.event.id, t.event])).values());
  const ticketsForSelectedEvent = availableTickets.filter((t) => t.event.id === selectedEvent?.id);

  return (
    <View style={{ flex: 1 }}>
      {/* 🧭 טאב תחתון */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1D2B64',
          tabBarInactiveTintColor: '#C7C7CC',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: 'absolute',
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            height: Platform.OS === 'ios' ? 80 : 70,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
          },
        }}
      >
        <Tabs.Screen name="about" options={{
          title: t('tabAbout'),
          tabBarIcon: ({ color }) => (<Ionicons name="information-circle-outline" size={24} color={color} />),
          tabBarItemStyle: { marginRight: 4 },
        }} />
        <Tabs.Screen name="my-tickets" options={{
          title: t('tabMyTickets'),
          tabBarIcon: ({ color }) => (<MaterialIcons name="confirmation-number" size={24} color={color} />),
          tabBarItemStyle: { marginRight: 28 },
        }} />
        <Tabs.Screen name="my-coupons" options={{
          title: t('tabMyCoupons'),
          tabBarIcon: ({ color }) => (<Ionicons name="pricetag-outline" size={24} color={color} />),
          tabBarItemStyle: { marginLeft: 28 },
        }} />
        <Tabs.Screen name="profile" options={{
          title: t('tabProfile'),
          tabBarIcon: ({ color }) => (<FontAwesome name="user-o" size={24} color={color} />),
          tabBarItemStyle: { marginLeft: 4 },
        }} />
        <Tabs.Screen name="manual-transfers" options={{ href: null }} />
        <Tabs.Screen name="_layout1" options={{ href: null }} />
      </Tabs>

      {/* ➕ כפתור עגול לפתיחת אופציות */}
      <TouchableOpacity
        style={[styles.fab, showOptions && styles.fabActive]}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Image source={require('../../assets/icons/square.png')} style={styles.fabIcon} />
      </TouchableOpacity>

      {showOptions && (
        <>
          <View style={styles.darkOverlay} />
          <View style={styles.optionsOverlay}>
<TouchableOpacity
  style={styles.optionButton}
  onPress={() => {
    setShowOptions(false);

    if (availableTickets.length === 0) {
      setAlertMessage(t('noTicketsAvailable')); // ⬅️ תוסיף מפתח תרגום חדש
      setAlertVisible(true);
      return;
    }

    setModalVisible(true);
    setStep(1);
    setSelectedEvent(null);
    setSelectedTickets([]);
  }}
>
              <Image source={require('../../assets/icons/sell_tickets0.png')} style={styles.optionIcon} />
            </TouchableOpacity>
            <Text style={styles.optionText}>{t('sellTicketInApp')}</Text>

            <TouchableOpacity style={styles.optionButton} onPress={handleExternalUpload}>
              <View style={styles.iconWrapper}>
                <Image source={require('../../assets/icons/upload.png')} style={styles.uploadIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.optionText}>{t('uploadExternalTicket')}</Text>
          </View>
        </>
      )}

      {/* 📦 חלון מכירה פנימית */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* כפתור חזור */}
            <View style={[{ alignItems: 'center', marginBottom: 12 },I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}>
              <TouchableOpacity onPress={() => step === 1 ? setModalVisible(false) : setStep(step - 1)}>
                <Ionicons name="arrow-back-circle-outline" size={32} color="#1D2B64" />
              </TouchableOpacity>
            </View>
 
{step === 1 && (
  <>
    <View style={styles.headerRow}>
      <Image source={require('../../assets/images/just_logo.png')} style={styles.headerLogo} />
      <Text style={styles.headerText}>{t('step1_title')}</Text>
    </View>
    <View style={styles.headerLine} />
    <Text style={styles.sectionTitle}>{t('select_event')}</Text>
    <ScrollView style={{ width: '100%' }}>
      {uniqueEvents.map((event) => {
        const isSelected = selectedEvent?.id === event.id;
        return (
          <TouchableOpacity
            key={event.id}
            style={[
              styles.eventButton,
              { backgroundColor: isSelected ? '#d0e8ff' : '#ECF0FF' },
            ]}
            onPress={() => setSelectedEvent(event)}
          >
            <Text style={styles.eventText}>{event.name}</Text>
            <Image source={require('../../assets/icons/chevron.png')} style={[{ width: 20, height: 20 },I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    <TouchableOpacity
      style={[styles.continueButton, { opacity: selectedEvent ? 1 : 0.5 }]}
      disabled={!selectedEvent}
      onPress={() => setStep(2)}
    >
      <View style={{ width: 30 }} />
      <Text style={styles.continueText}>{t('continue_next')}</Text>
      <View style={[styles.iconCircle,I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </View>
    </TouchableOpacity>
  </>
)}

{step === 2 && (
  <>
    <View style={styles.headerRow}>
      <Image source={require('../../assets/images/just_logo.png')} style={styles.headerLogo} />
      <Text style={styles.headerText}>{t('step2_title')}</Text>
    </View>
    <View style={styles.headerLine} />
    <Text style={styles.sectionTitle}>{t('select_tickets')}</Text>
    <ScrollView style={{ width: '100%' }}>
      {ticketsForSelectedEvent.map((ticket) => {
        const isSelected = selectedTickets.includes(ticket.id);
        return (
          <TouchableOpacity
            key={ticket.id}
            style={[
              styles.eventButton,
              {
                backgroundColor: '#EDF0FE',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            ]}
            onPress={() => {
              setSelectedTickets((prev) =>
                isSelected ? prev.filter((id) => id !== ticket.id) : [...prev, ticket.id]
              );
            }}
          >
            <Text style={styles.eventText}>
              {ticket.seatDescription} ({ticket.price}₪)
            </Text>
            <View
              style={[
                styles.circleIconWrapper,
                { backgroundColor: isSelected ? '#FDB813' : '#ccc' },
              ]}
            >
              <Image
                source={require('../../assets/icons/checkbox_checked.png')}
                style={styles.checkboxImage}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    <TouchableOpacity
      style={[styles.continueButton, { opacity: selectedTickets.length > 0 ? 1 : 0.5 }]}
      disabled={selectedTickets.length === 0}
      onPress={() => setStep(3)}
    >
      <View style={{ width: 30 }} />
      <Text style={styles.continueText}>{t('continue_next')}</Text>
      <View style={[styles.iconCircle,I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </View>
    </TouchableOpacity>
  </>
)}

{step === 3 && (
  <>
    <View style={styles.headerRow}>
      <Image source={require('../../assets/images/just_logo.png')} style={styles.headerLogo} />
      <Text style={styles.headerText}>{t('step3_title')}</Text>
    </View>
    <View style={styles.headerLine} />
    <Text style={styles.sectionTitle}>{t('buyer_details')}</Text>
<ScrollView style={{ width: '100%' }}>
  <View style={styles.inputWrapper}>
    <Image source={require('../../assets/icons/Message.png')} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, { textAlign: 'right' }]}
      placeholder={t('buyer_email')}
      placeholderTextColor="#807A7A"
      value={buyerEmail}
      onChangeText={setBuyerEmail}
    />
  </View>

  <View style={styles.inputWrapper}>
    <Image source={require('../../assets/icons/coin.png')} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, { textAlign: 'right' }]}
      placeholder={t('price')}
      placeholderTextColor="#807A7A"
      keyboardType="numeric"
      value={price}
      onChangeText={setPrice}
    />
  </View>

  <View style={[styles.inputWrapper, { alignItems: 'flex-start' }]}>
    <Image
      source={require('../../assets/icons/speech-bubble.png')}
      style={[styles.inputIcon, { marginTop: 2, alignSelf: 'flex-start' }]}
    />
    <TextInput
      style={[styles.input, { minHeight: 100, textAlignVertical: 'top', textAlign: 'right' }]}
      placeholder={t('comments_optional')}
      placeholderTextColor="#807A7A"
      value={comments}
      onChangeText={setComments}
      multiline
    />
  </View>
</ScrollView>
    <TouchableOpacity
      style={[
        styles.continueButton,
        {
          opacity: buyerEmail && price && selectedTickets.length > 0 ? 1 : 0.5,
        },
      ]}
      disabled={!buyerEmail || !price || selectedTickets.length === 0}
      onPress={async () => {
        const result = await initiateTicketTransfer(
          selectedTickets,
          buyerEmail,
          parseFloat(price),
          comments
        );
        if (result.success) {
          setModalVisible(false);
          Alert.alert(t('success'), t('transfer_success'));
        } else {
          Alert.alert(t('error'), result.message || t('transfer_failed'));
        }
      }}
    >
      <View style={{ width: 30 }} />
      <Text style={styles.continueText}>{t('confirm_transfer')}</Text>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={16} color="white" />
      </View>
    </TouchableOpacity>
  </>
)}
        </View>
      </View>
    </Modal>

    <CustomAlert visible={alertVisible} message={alertMessage} onClose={() => setAlertVisible(false)} />
  </View>
);
}

const styles = StyleSheet.create({
fab: {
  position: 'absolute',
  bottom: Platform.OS === 'ios' ? 50 : 30,
  [I18nManager.isRTL ? 'right' : 'left']: '50%', // ← משתנה לפי RTL
  transform: [{ translateX: -32 }],
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#1D2B64',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // ✨ מרכז את כל התוכן אופקית
  marginBottom: 8,
  width: '100%',
},
inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 16,
},

inputIcon: {
  width: 20,
  height: 20,
  marginRight: 8,
  resizeMode: 'contain',
  tintColor: '#807A7A', // אפשרי – יתאים לצבע ה־placeholder
},

input: {
  flex: 1,
  fontSize: 16,
  fontFamily: 'Poppins-Regular',
  color: '#000', // צבע הטקסט עצמו לאחר הקלדה
  paddingVertical: 0, // מבטל רווח אנכי מיותר
},
headerLogo: {
  width: 40,
  height: 40,
  resizeMode: 'contain',
  marginRight: 8,
},

headerText: {
  fontFamily: 'Poppins-SemiBold',
  fontSize: 16,
  color: '#1D2B64',
  flexShrink: 1,
},

headerLine: {
  height: 2,
  backgroundColor: '#EDF0FE',
  width: '100%',
  marginBottom: 12,
},

sectionTitle: {
  fontSize: 16,
  fontFamily: 'Poppins-Regular',
  textAlign: 'left',
  width: '100%',
  fontWeight: 600,
  color: '#120D26',
  marginBottom: 16,
},
  fabActive: { backgroundColor: '#FDB813' },
  fabIcon: { width: 22, height: 22, tintColor: '#fff' },
  optionsOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  sectionHeader: {
  width: '100%',
  marginBottom: 12,
},
 
circleIconWrapper: {
  width: 28,
  height: 28,
  borderRadius: 14,
  justifyContent: 'center',
  alignItems: 'center',
},

checkboxImage: {
  width: 16,
  height: 16,
  resizeMode: 'contain',
},
sectionUnderline: {
  height: 2,
  backgroundColor: '#EDF0FE',
  marginTop: 4,
  width: '100%',
},
optionButton: {
  height: 70, // ✨ גובה קבוע!
  backgroundColor: 'white',
  borderRadius: 30,
  paddingVertical: 12,
  paddingHorizontal: 24,
  marginVertical: 6,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  width: '60%',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 5,
  overflow: 'hidden', // חותך מה שגולש
},
continueButton: {
  backgroundColor: '#1D2B64',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 16,
  marginTop: 20,
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

continueText: {
  color: '#FFF',
  fontFamily: 'Poppins',
  fontSize: 18,
  fontStyle: 'normal',
  fontWeight: '600',
  lineHeight: undefined, // או מספר אם יש לך ערך
  textAlign: 'center',
  flex: 1,
},

iconCircle: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#354274', // ← הצבע המעודכן
  justifyContent: 'center',
  alignItems: 'center',
},

 
iconWrapper: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#ffb703',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
},

uploadIcon: {
  width: 25,
  height: 28,
  resizeMode: 'contain',
},
  optionIcon: { width: 52, height: 62, marginRight: 10 },
  optionText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    alignItems: 'center',
    width: '100%',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
 
  eventButton: {
    backgroundColor: '#EDF0FE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
 
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
 
 
});