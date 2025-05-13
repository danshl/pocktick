import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons'; // ייבוא של expo-vector-icons

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? 'light'].tint;
  const inactiveColor = '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
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
      }}>
      <Tabs.Screen
        name="about"
        options={{
          title: 'About Us',
          tabBarIcon: ({ color }) => <Ionicons name="information-circle" size={24} color={color} />, // אייקון של מידע
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: 'My Tickets',
          tabBarIcon: ({ color }) => <MaterialIcons name="confirmation-number" size={24} color={color} />, // אייקון כרטיסים
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />, // אייקון של פרופיל
        }}
      />
    </Tabs>
  );
}
