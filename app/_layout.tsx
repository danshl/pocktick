import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { UserDataProvider } from '../app/useUserData'; // ודא שהנתיב נכון

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <UserDataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="initial-loader" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="load-screen" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPasswordScreen" options={{ headerShown: false }} />
          <Stack.Screen name="change-password" options={{ headerShown: false }} />
          <Stack.Screen name="faqs" options={{ headerShown: false }} />
          <Stack.Screen name="user-profile" options={{ headerShown: false }} />
          <Stack.Screen name="ticket-details" options={{ headerShown: false }} />
          <Stack.Screen name="VerifyCodeScreen" options={{ headerShown: false }} />
          <Stack.Screen name="VerifyEmailScreen" options={{ headerShown: false }} />
          <Stack.Screen name="SetNewPasswordScreen" options={{ headerShown: false }} />
          <Stack.Screen name="GoogleSignIn" options={{ headerShown: false }} />
          <Stack.Screen name="verify-seller" options={{ headerShown: false }} />
          <Stack.Screen name="open-tickets-screen" options={{ headerShown: false }} />
          <Stack.Screen name="payment-success" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen name="external-upload" options={{ headerShown: false }} />
          <Stack.Screen name="show-my-tickets" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </UserDataProvider>
  );
}