import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ShowMyTicketsScreen() {
const router = useRouter();
const params = useLocalSearchParams();

let ticketUrls: string[] = [];
try {
  const raw = decodeURIComponent(params.ticketUrls as string);
  ticketUrls = JSON.parse(raw);
} catch (error) {
  console.error('Failed to parse ticketUrls:', error);
  ticketUrls = [];
}

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
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
            <View style={styles.card}>
              <Image
                source={{ uri: item }}
                style={styles.ticketImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsWrapper}>
        {ticketUrls.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1D2B64',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 10,
  },
  backArrow: {
    fontSize: 22,
    color: '#fff',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  carousel: {
    alignItems: 'center',
  },
  cardWrapper: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  ticketImage: {
    width: '100%',
    height: height * 0.7,
    borderRadius: 12,
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
  dotInactive: {
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#1D2B64',
  },
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