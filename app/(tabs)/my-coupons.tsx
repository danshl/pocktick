// app/my-coupons.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import useTranslation from '../i18n/useTranslation';

export default function MyCouponsScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/coming-soon.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>{t('couponsUnavailable')}</Text>
      <Text style={styles.highlight}>{t('couponsStayTuned')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  highlight: {
    fontSize: 16,
    color: '#1b2b68',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
});