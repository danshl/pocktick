import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
export default function OpenTicketsScreen() {
  const router = useRouter();
  const { transferId } = useLocalSearchParams();
  const [pressing, setPressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyOpened, setAlreadyOpened] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkIfAlreadyOpened = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const res = await fetch(
          `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/${transferId}/is-opened`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const isOpened = await res.json();
          setAlreadyOpened(isOpened);
        }
      } catch (err) {
        console.error('Error checking if tickets are already opened', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkIfAlreadyOpened();
  }, []);

  const openTickets = async (skipLoading = false) => {
    try {
      if (!skipLoading) setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/open-tickets/${transferId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.ticketUrls?.length > 0) {
          await Linking.openURL(data.ticketUrls[0]);
        } else {
          Alert.alert('No tickets exist');
        }

//         const data = await res.json();
//         await AsyncStorage.setItem('ticketUrls', JSON.stringify(data.ticketUrls));
// router.replace('/show-my-tickets');
      } else {
        const text = await res.text();
        Alert.alert('Error', text || 'Failed to open tickets');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
      console.error(err);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  };

  const startHold = () => {
    setPressing(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        openTickets();
      }
    });
  };

  const cancelHold = () => {
    setPressing(false);
    progress.stopAnimation();
    progress.setValue(0);
  };

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  if (checkingStatus) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={require('../assets/icons/arrow-left.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <Image source={require('../assets/icons/logo_full_blue.png')} style={styles.logo} />

      {alreadyOpened ? (
        <>
          <Text style={styles.infoText}>These tickets are already opened. You can view the QR codes now. Enjoy!</Text>
          <TouchableOpacity
            style={styles.holdCircleWrapper}
            onPress={() => openTickets(true)}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Image source={require('../assets/icons/happiness.png')} style={styles.cursorIcon} />
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.infoText}>
            Once opened, the responsibility for the tickets is transferred to you. We recommend opening
            them only shortly before the event.
          </Text>

          <Text style={styles.pressText}>Press & Hold 3 Seconds</Text>

          <Animated.View style={[styles.holdCircleWrapper, { transform: [{ scale }] }]}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.holdCircle}
              onPressIn={startHold}
              onPressOut={cancelHold}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Image source={require('../assets/icons/fingerprint.png')} style={styles.cursorIcon} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

{!alreadyOpened && (
  <>
    <TouchableOpacity style={styles.helpBtn} onPress={() => setShowHelpModal(true)}>
      <Image source={require('../assets/icons/info.png')} style={styles.helpIcon} />
      <Text style={styles.helpText}>Why can't I see my tickets right now?</Text>
    </TouchableOpacity>

    <Modal
      visible={showHelpModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Why can't I see my tickets?</Text>
          <ScrollView>
            <Text style={styles.modalText}>
              Our system records the exact time you opened the ticket. If there's an issue entering the event,
              we check the check-in timestamp recorded by the venue. If your opening time is after the official check-in,
              you're fully protected and will get your money back. If the opening time is before check-in, we can't verify
              your claim, so we recommend opening the ticket just a few seconds before the show starts.{"\n\n"}
              Don't worry! We verify within 24 hours that the uploaded image matches the ticket description.
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowHelpModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#1D2B64',
  },
  logo: {
    width: 280,
    height: 80,
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  pressText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 20,
  },
  holdCircleWrapper: {
    backgroundColor: '#FDB813',
    borderRadius: 100,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 50,
  },
  holdCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cursorIcon: {
    width: 70,
    height: 70,
    tintColor: '#d88d00',
  },
  helpBtn: {
    flexDirection: 'row',
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  helpIcon: {
    width: 18,
    height: 18,
    tintColor: '#1D2B64',
    marginRight: 10,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#444',
    lineHeight: 22,
  },
  modalCloseBtn: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#1D2B64',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
});