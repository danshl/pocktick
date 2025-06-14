import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // ✅ הוספת אייקונים
import { SafeAreaView } from 'react-native-safe-area-context';
const screenWidth = Dimensions.get('window').width;

export default function OpenTicketsScreen() {
  const { transferId } = useLocalSearchParams();
  const router = useRouter(); // ✅ נדרש לניווט אחורה
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<string[]>([]);
  const [pressedTime, setPressedTime] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
const [showInfo, setShowInfo] = useState(false);
  const handlePressIn = () => setPressedTime(Date.now());

  const handlePressOut = async () => {
    const now = Date.now();
    if (pressedTime && now - pressedTime >= 3000) {
      await openTickets();
    } else {
      Alert.alert('Hold Longer', 'Please press and hold for 3 seconds to view your tickets.');
    }
    setPressedTime(null);
  };

  const openTickets = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(
        `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/open-tickets/${transferId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setTickets(data.ticketUrls || []);
      } else {
        const text = await res.text();
        Alert.alert('Error', text || 'Failed to open tickets');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

return (
<SafeAreaView style={styles.container}>
  {/* חץ חזור */}
  <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={28} color="#1D2B64" />
  </TouchableOpacity>

  <ScrollView contentContainerStyle={styles.scrollContent}>
    {/* כאן תמקם את התמונה, והיא תהיה מתחת לחץ */}
    <View style={{ alignItems: 'center', marginTop:-60 }}>
      <Image
        source={require('../assets/images/name.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
    </View>

      {tickets.length === 0 && !loading && (
        <View>
          <Text style={styles.warning}>
            Once opened, the responsibility for the tickets is transferred to you.
            We recommend opening them only shortly before the event.
          </Text>

          <View style={styles.centered}>
            <TouchableOpacity
              style={styles.circleButton}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={styles.buttonText}>Press & Hold{'\n'}3 Seconds</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <TouchableOpacity onPress={() => setShowInfo(!showInfo)}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="help-circle-outline" size={20} color="#1D2B64" />
                  </View>
                  <Text style={styles.infoTitle}>Why can't I see my tickets right now?</Text>
                </View>
              </TouchableOpacity>

              {showInfo && (
                <Text style={styles.infoText}>
                  For your protection, tickets are securely locked until you actively open them.
                  This ensures that if a ticket was used before your unlock time, we can detect it and refund you in full.
                  {'\n\n'}
                  Once opened, the responsibility is transferred to you, and we can no longer verify the tickets.
                  So rest assured — we validate everything beforehand so you can feel safe.
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#1D2B64" style={{ marginTop: 20 }} />
      )}

      {tickets.length > 0 && (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContainer}
          >
            {tickets.map((uri, idx) => (
              <View key={idx} style={styles.ticketWrapper}>
                <Image source={{ uri }} style={styles.ticketImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {tickets.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  activeIndex === i ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
backButton: {
  position: 'absolute',
  top: 80, // עכשיו כבר יש safe area, אין צורך בפיקסלים
  left: 20,
  zIndex: 10,
},
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    backgroundColor: '#ffb703',
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  buttonText: {
    color: '#1b2b68',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  warning: {
    fontSize: 16,
    color: '#1b2b68',
    marginTop: 12,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  scrollContainer: {
    alignItems: 'center',
  },
 
ticketWrapper: {
  width: screenWidth * 0.87,
  marginRight: 16, // רווח בין כרטיסים
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#1D2B64',
  padding: 10,
  backgroundColor: '#f5f5f5',
  alignSelf: 'center',
},
  ticketImage: {
    width: '100%',
    height: 500,
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#1D2B64',
  },
headerImage: {
  width: 180,
  height: 60,
  alignSelf: 'center',
  marginTop: 40, // במקום 150
  marginBottom: 40,
},
infoBox: {
  backgroundColor: '#f0f4ff',
  borderRadius: 10,
  padding: 10,
  borderWidth: 1,
  borderColor: '#cfd8ff',
  minHeight: 50,         // כדי לא לקרוס לגובה קטן
  width: '100%',          // 👈 מחייב את הרוחב להיות מלא
  alignSelf: 'center',    // מבטיח שהקופסה לא תזוז לשוליים
},

infoHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},

infoIcon: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#dbe3ff',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 8,
},

infoTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#1D2B64',
  flex: 1,
  flexWrap: 'wrap',
},

infoText: {
  fontSize: 14,
  color: '#333',
  lineHeight: 20,
},
scrollContent: {
  padding: 24,
  paddingTop: 120,
  paddingBottom: 40,
},
showMoreText: {
  color: '#1D2B64',
  fontWeight: '600',
  fontSize: 14,
  marginTop: 4,
  textDecorationLine: 'underline',
}
});
