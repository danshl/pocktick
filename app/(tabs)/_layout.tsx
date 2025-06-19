import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../CustomAlert';

export default function TabLayout() {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleExternalUpload = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/sellerverification/status',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

if (res.ok) {
  const data = await res.json();
  const status = data.status?.toLowerCase();
  if (status === 'approved') {
    setShowOptions(false);
    router.push('/external-upload');
  } else {
    setAlertMessage('Please verify your account via the Profile screen before uploading tickets.');
    setAlertVisible(true);
  }
} else {
  setAlertMessage('Error checking verification status.');
  setAlertVisible(true);
}
} catch (err) {
  console.error('Verification API error:', err);
  setAlertMessage('An error occurred while connecting to the server.');
  setAlertVisible(true);
}

  };

  return (
    <View style={{ flex: 1 }}>
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
        <Tabs.Screen
          name="about"
          options={{
            title: 'About Us',
            tabBarIcon: ({ color }) => (
              <Ionicons name="information-circle-outline" size={24} color={color} />
            ),
            tabBarItemStyle: { marginRight: 4 },
          }}
        />
        <Tabs.Screen
          name="my-tickets"
          options={{
            title: 'My Tickets',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="confirmation-number" size={24} color={color} />
            ),
            tabBarItemStyle: { marginRight: 28 },
          }}
        />
        <Tabs.Screen
          name="my-coupons"
          options={{
            title: 'My Coupons',
            tabBarIcon: ({ color }) => (
              <Ionicons name="pricetag-outline" size={24} color={color} />
            ),
            tabBarItemStyle: { marginLeft: 28 },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-o" size={24} color={color} />
            ),
            tabBarItemStyle: { marginLeft: 4 },
          }}
        />
        <Tabs.Screen name="manual-transfers" options={{ href: null }} />
        <Tabs.Screen name="_layout1" options={{ href: null }} />
      </Tabs>

      {/* Overlay */}
      {showOptions && (
        <View
          style={[
            styles.darkOverlay,
            {
              bottom: Platform.OS === 'ios' ? 80 : 70,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
            },
          ]}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, showOptions && styles.fabActive]}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Image
          source={require('../../assets/icons/square.png')}
          style={styles.fabIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Options */}
      {showOptions && (
        <View style={styles.optionsOverlay}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              router.push('/internal-transfer');
            }}
          >
            <Image source={require('../../assets/icons/square.png')} style={styles.optionIcon} />
          </TouchableOpacity>
          <Text style={styles.optionText}>Selling ticket inside Pockticket</Text>

          <TouchableOpacity style={styles.optionButton} onPress={handleExternalUpload}>
            <Image source={require('../../assets/icons/square.png')} style={styles.optionIcon} />
          </TouchableOpacity>
          <Text style={styles.optionText}>Upload & sell external ticket</Text>
        </View>
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: '50%',
    transform: [{ translateX: -32 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1D2B64',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D2B64',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  fabActive: {
    backgroundColor: '#FDB813',
  },
  fabIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
  optionsOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 6,
    alignItems: 'center',
    flexDirection: 'column',
    width: '60%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  optionIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 998,
  },
});
