import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

export default function AuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      const rtlDisabled = await AsyncStorage.getItem('rtlDisabled');

      if (I18nManager.isRTL && rtlDisabled !== 'true') {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        await AsyncStorage.setItem('rtlDisabled', 'true');
        await Updates.reloadAsync(); // 🔁 ריסט מלא כדי שהשינוי ייכנס לתוקף
        return;
      }

      const token = await AsyncStorage.getItem('token');
      console.log("✅ Token:", token);
      if (token) {
        router.replace('/(tabs)/my-tickets');
      } else {
        router.replace('/initial-loader');
      }
    };

    initialize();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}