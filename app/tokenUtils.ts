import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function handleToken(token: string, email: string) {
  const decoded: any = jwtDecode(token);
  const expiresAt = decoded.exp * 1000; // JWT expiration is in seconds; convert to ms

  await AsyncStorage.setItem('authToken', token);
  await AsyncStorage.setItem('authTokenExpiresAt', expiresAt.toString());
  await AsyncStorage.setItem('userEmail', email);
}