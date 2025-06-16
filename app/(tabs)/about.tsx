import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'react-native';
export default function AboutUsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
         
<View style={styles.headerImageContainer}>
  <Image
    source={require('../../assets/images/name.png')} // או URI חיצוני
    style={styles.headerImage}
    resizeMode="contain"
  />
</View>

      <Text style={styles.sectionTitle}>Your Smart & Secure Ticket Wallet</Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>PockTick</Text> is an all-in-one platform for securely storing, managing, and transferring event tickets — whether they were purchased from official ticket companies or private individuals.
      </Text>

      <Text style={styles.sectionTitle}>Direct from Companies</Text>
      <Text style={styles.paragraph}>
        Tickets from companies that work with PockTick are automatically delivered to your app. No more digging through emails or worrying about lost files. Just open the app and you're ready to go.
      </Text>

      <Text style={styles.sectionTitle}>Safe Peer-to-Peer Transfers</Text>
      <Text style={styles.paragraph}>
        Received a ticket from a friend or bought one from someone else? We make sure it's secure. Private sellers go through a verification process, and tickets are locked until you choose to open them — ensuring full protection.
      </Text>

      <Text style={styles.sectionTitle}>Verified and Transparent</Text>
      <Text style={styles.paragraph}>
        Every transfer is tracked, every QR code is refreshed, and every ticket is checked. From event details to seat types, we make sure what you get is exactly what you expected.
      </Text>

      <Text style={styles.sectionTitle}>One Community, One Account</Text>
      <Text style={styles.paragraph}>
        Each user has a single verified account, valid for life. Sellers who violate trust are permanently removed, so you can feel confident buying and selling.
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
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 0,
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
  headerImageContainer: {
  alignItems: 'center',
  marginBottom: 20,
},
headerImage: {
  width: 180,
  height: 60,
},
});