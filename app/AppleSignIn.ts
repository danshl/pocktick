// hooks/useAppleLogin.ts
import * as AppleAuthentication from 'expo-apple-authentication';

export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const token = credential.identityToken;

    if (token) {
      console.log('✅ Apple token:', token);
      // תשלח לשרת שלך או תמשיך עם ה-token
    } else {
      console.warn('❌ No token received from Apple');
    }
  } catch (e: any) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      console.log('🚫 Apple login canceled by user');
    } else {
      console.error('❌ Apple login error:', e);
    }
  }
}
