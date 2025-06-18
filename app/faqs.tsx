import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function FaqsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={styles.container}
    >
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Image
        source={require('../assets/icons/arrow-left.png')}
        style={styles.backIcon}
      />
    </TouchableOpacity>

      <Text style={styles.title}>FAQs</Text>

      {faqData.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <Text style={styles.question}>{faq.question}</Text>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>
      ))}

      {/* ✅ כפתור */}
      <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/my-tickets')}>
        <Text style={styles.ctaText}>My Tickets</Text>
        <View style={styles.arrowCircle}>
          <Image source={require('../assets/icons/next_white.png')} style={styles.arrowIcon} />
        </View>
      </TouchableOpacity>

      <Text style={styles.contact}>
        For any further questions, feel free to reach us at{' '}
        <Text style={styles.email}>support@pocktick.com</Text>
      </Text>
    </ScrollView>
  );
}

const faqData = [
  {
    question: 'How do I know the ticket is valid and matches what was ordered?',
    answer:
      'Every ticket is reviewed by the PockTick team within 24 hours of upload. We verify the date, time, location, seat type, and price to ensure it matches the event details.',
  },
  {
    question: 'How do you ensure the seller is trustworthy?',
    answer:
      'Private sellers must go through a strict one-time verification process including ID, photo, and video. Each person can have only one lifetime account. If a seller is caught cheating, they are permanently banned. In severe cases, legal action can be taken through PockTick.',
  },
  {
    question: 'Why are tickets locked until opening?',
    answer:
      'To protect buyers. Tickets from private individuals stay locked until the buyer chooses to open them. If there’s a problem, we compare the time the ticket was opened with the official check-in time. If opened after check-in — the buyer is protected and refunded. If opened before — the responsibility lies with the buyer.',
  },
  {
    question: 'When should I open the ticket?',
    answer:
      'Open your ticket just a few seconds before entering the event. This ensures full protection in case of a dispute.',
  },
  {
    question: 'What happens if there was a problem after I opened the ticket?',
    answer:
      'You can file an appeal in the app. We investigate each case with the ticket company and respond accordingly.',
  },
  {
    question: 'When does the money transfer to the seller?',
    answer:
      '24 hours after the event ends. This gives time for the buyer to report any issues before funds are released.',
  },
  {
    question: 'Can I buy tickets from official ticket companies through PockTick?',
    answer:
      'Yes. Companies that work with us send tickets directly to your wallet without needing to contact a seller.',
  },
  {
    question: 'How can I sell a ticket through PockTick?',
    answer:
      'After completing a one-time verification, private sellers can upload tickets and transfer them safely to buyers with full protection on both sides.',
  },
];

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 80,
    paddingBottom: 60,
  },
  backButton: {
    marginBottom: 20,
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
  marginBottom: 30,
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
  backgroundColor: '#1D2B64',
  borderRadius: 20,
  paddingVertical: 15,
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
  shadowColor: '#1D2B64',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
  marginBottom: 10,
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
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
});