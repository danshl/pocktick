// app/faqs.tsx
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
        <View style={styles.backCircle}>
          <Image
            source={{
              uri: 'https://tickectexchange.blob.core.windows.net/ui-assets/back-arrow.png',
            }}
            style={styles.backIcon}
          />
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>FAQs</Text>

      <View style={styles.faqItem}>
        <Text style={styles.question}>What is PockTick?</Text>
        <Text style={styles.answer}>
          PockTick is a secure platform to manage and transfer event tickets.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>How does ticket transfer work?</Text>
        <Text style={styles.answer}>
          When you transfer a ticket, its QR code is regenerated, preventing fraud or resale duplication.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Why is the resale price set to 110%?</Text>
        <Text style={styles.answer}>
          This discourages scalping and ensures a fair secondary market.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>Can I use my ticket multiple times?</Text>
        <Text style={styles.answer}>
          No. Once a ticket is used or transferred, its QR code becomes invalid to prevent duplicate entry.
        </Text>
      </View>

      <View style={styles.faqItem}>
        <Text style={styles.question}>How long is a ticket valid after purchase?</Text>
        <Text style={styles.answer}>
          Tickets are valid until the event date, unless transferred to another user.
        </Text>
      </View>

      <Text style={styles.contact}>
        For any further questions, feel free to reach us at{' '}
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
    alignSelf: 'flex-start',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  faqItem: {
    marginBottom: 25,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contact: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  email: {
    fontWeight: 'bold',
    color: '#5787E2',
  },
});
