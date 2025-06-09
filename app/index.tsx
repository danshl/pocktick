import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { I18nManager } from 'react-native';

export default function AuthCheck() {
  console.log("✅ Reached index screen");
  const router = useRouter();

  useEffect(() => {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
    const check = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log(token);
      if (token) {
        router.replace('/(tabs)/my-tickets');
      } else {
        router.replace('/initial-loader');
      }
    };

    check();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
