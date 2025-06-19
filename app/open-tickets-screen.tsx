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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OpenTicketsScreen() {
  const router = useRouter();
  const { transferId } = useLocalSearchParams();
  const [pressing, setPressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
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
          if (isOpened) {
            await openTickets(true);
            return;
          }
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
        router.replace({ pathname: '/show-my-tickets', params: { ticketUrls: JSON.stringify(data.ticketUrls) } });
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
            <Image source={require('../assets/icons/arrow-left.png')} style={styles.cursorIcon} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.helpBtn}>
        <Image source={require('../assets/icons/arrow-left.png')} style={styles.helpIcon} />
        <Text style={styles.helpText}>Why can't I see my tickets right now?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    width: 180,
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
    width: 30,
    height: 30,
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
});