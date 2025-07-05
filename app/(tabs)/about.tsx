import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import useTranslation from '../i18n/useTranslation';

export default function AboutUsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.headerImageContainer}>
        <Image
          source={require('../../assets/icons/logo_full_blue.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={isRTL ? styles.rtlContainer : null}>
        <Text style={styles.sectionTitle}>{t('aboutTitle')}</Text>
        <Text style={styles.paragraph}>{t('aboutDesc1')}</Text>

        <Text style={styles.sectionTitle}>{t('aboutTitle2')}</Text>
        <Text style={styles.paragraph}>{t('aboutDesc2')}</Text>

        <Text style={styles.sectionTitle}>{t('aboutTitle3')}</Text>
        <Text style={styles.paragraph}>{t('aboutDesc3')}</Text>

        <Text style={styles.sectionTitle}>{t('aboutTitle4')}</Text>
        <Text style={styles.paragraph}>{t('aboutDesc4')}</Text>

        <Text style={styles.sectionTitle}>{t('aboutTitle5')}</Text>
        <Text style={styles.paragraph}>{t('aboutDesc5')}</Text>

        <View style={styles.contactContainer}>
          <Text style={styles.questions}>{t('aboutQuestions')}</Text>
          <Text style={styles.contact}>
            {t('aboutContact')} <Text style={styles.email}>support@pocktick.com</Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/my-tickets')}>
        <Text style={styles.ctaText}>{t('aboutButton')}</Text>
        <View style={[styles.arrowCircle,  I18nManager.isRTL && { transform: [{ rotate: '180deg' }]}]}>
          <Image source={require('../../assets/icons/next_white.png')} style={styles.arrowIcon} />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
headerImageContainer: {
  alignItems: 'center',
  marginBottom: 10,
},

headerImage: {
  width: 380,
  height: 180,
  marginBottom: -30, // במקום bottom/right – לא ישפיע על יישור
  alignSelf: 'center', // מבטיח שהתמונה באמת במרכז
},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 8,
    marginTop: 15,
    fontFamily: 'Poppins-Bold',
    textAlign: 'left',
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1D2B64',
  },
  contactContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
questions: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1D2B64',
  marginBottom: 8,
  fontFamily: 'Poppins-Bold',
  textAlign: 'center',  
},
contact: {
  fontSize: 14,
  color: '#666',
  paddingHorizontal: 20,
  fontFamily: 'Poppins-Regular',
  textAlign: 'center', 
},
  email: {
    color: '#1D2B64',
    fontWeight: '600',
  },
ctaButton: {
  backgroundColor: '#1D2B64',
  borderRadius: 20,
  height: 56,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 20,
  width: 280,
  alignSelf: 'center',
  marginTop: 10,
  marginBottom: 40,
},
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  arrowCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 999,
    padding: 10,
    marginLeft: 16,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  rtlContainer: {
    direction: 'rtl',
    alignSelf: 'stretch',
  },
});