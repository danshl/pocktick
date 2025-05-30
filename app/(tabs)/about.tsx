import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutUsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>About PockTick</Text>

      <Text style={styles.sectionTitle}>Your All-in-One Ticket Wallet</Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>PockTick</Text> is your go-to app for storing, managing, and transferring all your event tickets. Everything stays in one place – simple, secure, and always available.
      </Text>

      <Text style={styles.sectionTitle}>No More Lost Tickets</Text>
      <Text style={styles.paragraph}>
        Companies are now issuing tickets directly to PockTick, so you never have to dig through emails or screenshots. Each ticket is stored, updated, and verified in your personal wallet.
      </Text>

      <Text style={styles.sectionTitle}>Fraud-Free Transfers</Text>
      <Text style={styles.paragraph}>
        Every ticket transfer generates a new QR code – making sure no one can reuse or resell a ticket dishonestly. We make events safer for everyone.
      </Text>

      <Text style={styles.sectionTitle}>Fair Resale Pricing</Text>
      <Text style={styles.paragraph}>
        To avoid scalping and inflated prices, tickets are always resold at <Text style={styles.bold}>110%</Text> of the original price. It’s fair for buyers, and still worthwhile for sellers.
      </Text>

      <Text style={styles.sectionTitle}>One Secure Platform</Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>PockTick</Text> is the first app built to securely manage and resell all your tickets – in a way that's simple, safe, and transparent.
      </Text>

      <View style={styles.contactContainer}>
        <Text style={styles.questions}>Questions?</Text>
        <Text style={styles.contact}>
          Contact us at <Text style={styles.email}>support@pocktick.com</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D2B64',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 8,
    marginTop: 28,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1D2B64',
  },
  contactContainer: {
    marginTop: 60,
    marginBottom: 80,
    alignItems: 'center',
  },
  questions: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D2B64',
    marginBottom: 8,
  },
  contact: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  email: {
    color: '#1D2B64',
    fontWeight: '600',
  },
});
