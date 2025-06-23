import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

export default function ShowMyTicketsScreen() {
  const router = useRouter();
  const [ticketUrls, setTicketUrls] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadTicketUrls = async () => {
      try {
        const raw = await AsyncStorage.getItem('ticketUrls');
        if (raw) {
          const urls = JSON.parse(raw);
          setTicketUrls(urls);
        }
      } catch (e) {
        console.error('❌ Failed to load ticket URLs:', e);
      }
    };
    loadTicketUrls();
  }, []);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleOpenUrl = async (url: string) => {
    Linking.openURL(url);
  };

  const handleDownload = async (url: string) => {
    try {
      const filename = url.split('/').pop()?.split('?')[0] || 'ticket.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory + filename
      );
      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        Alert.alert('Download Complete', `Saved to:\n${result.uri}`);
      } else {
        Alert.alert('Error', 'Download failed.');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      Alert.alert('Error', 'Could not download the file.');
    }
  };

  if (!ticketUrls || ticketUrls.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No tickets to display.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Opened Tickets</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={ticketUrls}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carousel}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.webButton}
                onPress={() => handleOpenUrl(item)}
              >
                <Text style={styles.webButtonText}>צפה בדפדפן</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownload(item)}
              >
                <Text style={styles.downloadButtonText}>הורד קובץ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.dotsWrapper}>
        {ticketUrls.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, activeIndex === i ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1D2B64',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 10 },
  backArrow: { fontSize: 22, color: '#fff' },
  title: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#fff' },
  carousel: { alignItems: 'center' },
  cardWrapper: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
  },
  buttonContainer: {
    gap: 20,
    width: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D2B64',
    backgroundColor: '#fff',
  },
  webButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D2B64',
  },
  downloadButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1D2B64',
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotInactive: { backgroundColor: '#ccc' },
  dotActive: { backgroundColor: '#1D2B64' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
});