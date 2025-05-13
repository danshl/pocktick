// GoogleSignIn.ts (NEW FILE)
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();


export default function useGoogleLogin() {
    console.log("sd");
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '1087486296114-jte74c48l8mjsv3sdeommh15m5dvuiie.apps.googleusercontent.com',
    //webClientId: '1087486296114-p6rqrktpn5o4n487bpgm7gv8otco82tr.apps.googleusercontent.com',
    iosClientId: '1087486296114-8rtveh0oga5ni88hc3925vbiu4j2nb36.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
        console.log(response);
      const { authentication } = response;
      if (authentication?.accessToken) {
        // Save token or trigger backend auth
        AsyncStorage.setItem('authToken', authentication.accessToken);
        router.replace('/(tabs)/my-tickets');
      }
    }
  }, [response]);

  return { promptAsync, request };
}
