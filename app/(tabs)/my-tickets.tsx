import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserData } from '../useUserData';
import { fetchTickets } from '../ticketService'; // ודא שזה הנתיב הנכון
import { Animated, Easing } from 'react-native';
import { useRef, useEffect } from 'react';



export type Ticket = {
  id: number;
  price: number;
  createdAt: string;
  status: number;
  event: {
    id: number;
    name: string;
    date: string;
    location: string;
    startTime: string;
    gatesOpenTime: string;
    notes?: string;
    imageUrl: string;
  };
};

const statusLabels = ['Active', 'Pending', 'Transferred', 'Used'] as const;
const statusColors = ['#4CAF50', '#FFA726', '#9E9E9E', '#607D8B'];

export default function MyTicketsScreen() {
  const { tickets, setTickets } = useUserData();
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  };

  const refreshTickets = async () => {
    try {
      setRefreshing(true);
      startRotation(); // התחלת סיבוב
      const updatedTickets = await fetchTickets();
      setTickets(updatedTickets);
    } catch (err) {
      console.error('Failed to refresh tickets', err);
    } finally {
      stopRotation(); // עצירת סיבוב
      setRefreshing(false);
    }
  };

const filteredTickets = tickets.filter(
  (ticket) => Number(ticket.status) === selectedStatus
);

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() =>
        router.push({
          pathname: '/ticket-details',
          params: { ticket: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.event.imageUrl }}
          style={styles.ticketImageFull}
        />
        <View style={styles.eventNameTag}>
          <Text style={styles.eventNameText}>{item.event.name}</Text>
        </View>
        <View
          style={[
            styles.statusTag,
            { backgroundColor: statusColors[item.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>

      <View style={styles.ticketInfoBoxHorizontal}>
        <View style={styles.detailColumn}>
          <Text style={styles.label}>DATE</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="date-range" size={16} color="#777" />
            <Text style={styles.detail}>
              {new Date(item.event.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.detailColumn}>
          <Text style={styles.label}>LOCATION</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#777" />
            <Text style={styles.detail}>{item.event.location}</Text>
          </View>
        </View>
        <View style={styles.detailColumn}>
          <Text style={styles.label}>PRICE</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={16} color="#777" />
            <Text style={styles.detail}>₪{item.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {statusLabels.map((label, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedStatus(index)}
            style={[
              styles.tabButton,
              selectedStatus === index && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === index && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTickets.length === 0 ? (
        <Text style={styles.emptyText}>
          No {statusLabels[selectedStatus]} tickets found.
        </Text>
      ) : (
        <FlatList
          data={filteredTickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
<TouchableOpacity style={styles.refreshButton} onPress={refreshTickets}>
<Animated.Image
  source={require('../../assets/images/refresh.png')}
  style={[
    styles.refreshIcon,
    {
      transform: [{
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      }],
    }
  ]}
/>
</TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  padding: 20,
  paddingBottom: 100,
  position: 'relative', // חשוב!
  top: Platform.OS === 'android' ? -30 : 0,
},
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 10,
    marginTop: 50,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#1D2B64',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  ticketCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  imageWrapper: {
    position: 'relative',
  },
  ticketImageFull: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventNameTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 8,
  },
  eventNameText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ticketInfoBoxHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  detailColumn: {
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1D2B64',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
refreshButton: {
  position: 'absolute',
  bottom: 100,
  right: 24,
  backgroundColor: '#1D2B64',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
refreshIcon: {
  width: 28,
  height: 28,
  tintColor: '#fff',
},
refreshText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
},
});