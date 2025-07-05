import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import useTranslation from './i18n/useTranslation';

export default function AppealScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* חץ חזור צמוד לצד */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          styles.backButton,
          I18nManager.isRTL ? { left: 20 } : { right: 20 },
        ]}
      >
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={[
            styles.backIcon,
            I18nManager.isRTL && { transform: [{ rotate: '180deg' }] },
          ]}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Image source={require('../assets/images/name.png')} style={styles.image} />
        <Text style={styles.description}>{t('appealDescription')}</Text>
        <Text selectable style={styles.email}>appeals@pocktick.com</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 65,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#1D2B64',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    marginTop: 120,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: -20,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1D2B64',
  },
});