import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/manual-transfers')}
      >
        <Image
          source={require('../../assets/icons/square.png')}
          style={styles.fabIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

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
  fabIcon: {
  width: 22,
  height: 22,
  tintColor: '#fff', // אפשר להסיר אם התמונה בצבע מלא
},

});
