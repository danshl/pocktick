import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import useTranslation from './i18n/useTranslation';
import { I18nManager } from 'react-native';

const rtlAlign = StyleSheet.create({
  text: {
    textAlign: I18nManager.isRTL ? 'left' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});
export default function FaqsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const faqData = [
    {
      question: t('q1'),
      answer: t('a1'),
    },
    {
      question: t('q2'),
      answer: t('a2'),
    },
    {
      question: t('q3'),
      answer: t('a3'),
    },
    {
      question: t('q4'),
      answer: t('a4'),
    },
    {
      question: t('q5'),
      answer: t('a5'),
    },
    {
      question: t('q6'),
      answer: t('a6'),
    },
    {
      question: t('q8'),
      answer: t('a8'),
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={[styles.backIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{t('title')}</Text>

{faqData.map((faq, index) => (
  <View key={index} style={styles.faqItem}>
    <Text style={[styles.question, rtlAlign.text]}>{faq.question}</Text>
    <Text style={[styles.answer, rtlAlign.text]}>{faq.answer}</Text>
  </View>
))}

      <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/my-tickets')}>
        <Text style={styles.ctaText}>{t('cta')}</Text>
        <View style={styles.arrowCircle}>
          <Image source={require('../assets/icons/next_white.png')} style={[styles.arrowIcon, I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]} />
        </View>
      </TouchableOpacity>

      <Text style={styles.contact}>
        {t('contact')}{' '}
        <Text style={styles.email}>support@pocktick.com</Text>
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 80,
    paddingBottom: 60,
  },
  backButton: {
    marginBottom: 20,
    marginTop: -12,
    alignSelf: 'flex-start',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#1D2B64',
  },
title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  color: '#1D2B64',
  textAlign: 'center',
  fontFamily: 'Poppins-Bold',
},
  faqItem: {
    marginBottom: 30,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  answer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  contact: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  email: {
    fontWeight: 'bold',
    color: '#5787E2',
    fontFamily: 'Poppins-Bold',
  },
ctaButton: {
  position: 'relative',
  paddingVertical: 15,
  paddingHorizontal: 24,
  justifyContent: 'center',
  marginTop: 10,
  shadowColor: '#1D2B64',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
  marginBottom: 10,
    backgroundColor: '#1D2B64',
  borderRadius: 20,
  height: 56,
  flexDirection: 'row',
  alignItems: 'center',
  width: 335,
  alignSelf: 'center',
 
},

  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
arrowCircle: {
  position: 'absolute',
  right: 16,
  top: '90%',
  transform: [{ translateY: -12 }],
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 999,
  padding: 10,
},
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#fff',
  },
});