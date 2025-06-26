import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserData } from '../useUserData';
import { fetchUnifiedTickets } from '../ticketService';
import { Ticket } from '../types';
import { Modal, Pressable } from 'react-native'; // תוספת

const statusLabels = ['All', 'Active', 'Pending', 'Transferred', 'Used'] as const;

export default function MyTicketsScreen() {
  const { tickets, setTickets } = useUserData();
  const [selectedStatus, setSelectedStatus] = useState<number>(0);  
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true
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
      startRotation();
      const updatedTickets = await fetchUnifiedTickets();
      setTickets(updatedTickets);
    } catch (err) {
      console.error('Failed to refresh tickets', err);
    } finally {
      stopRotation();
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  const groupedTickets = Object.values(
    tickets
      .filter(ticket => selectedStatus === 0 || Number(ticket.status) === selectedStatus - 1)
      .reduce((acc, ticket) => {
        const key = ticket.isExternal
          ? `external-${ticket.id}`
          : `${ticket.event.id}-${ticket.status}-${ticket.transactionId ?? 'none'}`;
        if (!acc[key]) {
          acc[key] = {
            event: ticket.event,
            status: ticket.status,
            transactionId: ticket.transactionId ?? null,
            tickets: [ticket]
          };
        } else {
          acc[key].tickets.push(ticket);
        }
        return acc;
      }, {} as Record<string, {
        event: Ticket['event'];
        status: number;
        transactionId: number | null;
        tickets: Ticket[];
      }>)
  );

  const renderGroupedTicket = ({ item }: { item: typeof groupedTickets[0] }) => (
    <View style={styles.outerFrame}>
      <View style={styles.imageContainer}>
<View style={{ position: 'relative' }}>
  <Image
    source={
      item.event?.imageUrl && item.event.imageUrl.trim() !== ''
        ? { uri: item.event.imageUrl }
        : require('../../assets/images/favicon.png')
    }
    style={styles.ticketImage}
  />
  {item.status === 2 && (
    <View style={styles.imageOverlay} />
  )}
</View>
        {item.tickets[0].isExternal && (
          <Text style={{ fontSize: 12, color: '#1b2b68', marginTop: 4, left: 10 }}>
            Uploaded by user
          </Text>
        )}
<View style={styles.dateBox}>
  {(() => {
    const parts = item.event.date.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const dateObj = new Date(`${year}-${month}-${day}`);
      const isValid = !isNaN(dateObj.getTime());

      if (isValid) {
        return (
          <>
            <Text style={styles.dateDay}>{parseInt(day, 10)}</Text>
            <Text style={styles.dateMonth}>
              {dateObj.toLocaleString('en-US', { month: 'long' })} {/* או 'long' אם רוצים שם מלא */}
            </Text>
          </>
        );
      }
    }

    // fallback - תאריך לא תקין
    return <Text style={styles.dateDay}>{item.event.date}</Text>;
  })()}
</View>
        <View
          style={[styles.statusContainer, {
            backgroundColor:
            item.status === 1 ? '#FC803B' :  // Pending - כתום
            item.status === 2 ? '#339CFF' : // Transferred - כחול
            '#4CAF50'      
          }]}
        >
          <Text style={styles.statusText}>{statusLabels[item.status+1]}</Text>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.eventTitle}>{item.event.name}</Text>
        <View style={styles.locationRow}>
          <Image source={require('../../assets/icons/location.png')} style={styles.locationIcon} />
          <Text style={styles.locationText}>{item.event.location}</Text>
        </View>
        <View style={styles.ticketBottomRow}>
          <Text style={styles.price}>
            {item.tickets.reduce((sum, t) => sum + t.price, 0)} ₪ 
          </Text>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push({ pathname: '/ticket-details', params: { tickets: JSON.stringify(item.tickets) } })}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
            <Image source={require('../../assets/icons/chevron.png')} style={styles.detailsArrow} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2B68" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconLeft}>
          <Image source={require('../../assets/icons/hamburger.png')} style={styles.iconImage} />
        </TouchableOpacity>
        <Image source={require('../../assets/icons/logo_full_white.png')} style={styles.logo} />
        <TouchableOpacity style={styles.headerIconRight}>
          <Image source={require('../../assets/icons/notfic.png')} style={styles.iconImage} />
        </TouchableOpacity>
      </View>
<View style={styles.singleFilterWrapper}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setStatusMenuVisible(true)}
      >
<View style={styles.filterButtonContent}>
  <Image
    source={require('../../assets/icons/filter-4.png')}  
    style={styles.filterButtonIcon}
  />
  <Text style={styles.filterButtonText}>
    {statusLabels[selectedStatus]}
  </Text>
</View>
      </TouchableOpacity>

  <Modal
    transparent
    visible={statusMenuVisible}
    animationType="fade"
    onRequestClose={() => setStatusMenuVisible(false)}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      onPress={() => setStatusMenuVisible(false)}
    >
      <View style={styles.modalMenu}>
        {statusLabels.map((label, index) => (
          <Pressable
            key={index}
            style={styles.menuItem}
            onPress={() => {
              setSelectedStatus(index);
              setStatusMenuVisible(false);
            }}
          >
            <Text style={styles.menuItemText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
</View>
<FlatList
  data={groupedTickets}
  renderItem={renderGroupedTicket}
  keyExtractor={item => `${item.event.id}-${item.status}-${item.transactionId ?? 'none'}-${item.tickets.map(t => t.id).join('-')}`}
  contentContainerStyle={styles.ticketList}
  showsVerticalScrollIndicator={false}
  refreshing={refreshing}
  onRefresh={refreshTickets}
  ListEmptyComponent={
    <Text style={styles.emptyText}>
      No {statusLabels[selectedStatus]} tickets found.
    </Text>
  }
/>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  tabBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -15,
    marginBottom: 20,
    paddingHorizontal: 16
  },
  tabButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  tabButtonActive: { backgroundColor: '#FFC107' },
  tabText: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#1D2B64' },
  tabTextActive: { fontFamily: 'Poppins-Bold', color: '#1D2B64' },
  ticketList: { paddingHorizontal: 20, paddingBottom: 80 },
  outerFrame: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10
  },
  ticketImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    borderRadius: 16
  },
  dateBox: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFFEB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center'
  },
  dateDay: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#1D2B64', marginBottom:-6 },
  dateMonth: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#1D2B64' },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  detailsContainer: {
    flexDirection: 'column',
    gap: 6
  },
  eventTitle: { fontSize: 18, fontFamily: 'Poppins-bold', color: '#000' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationIcon: { width: 14, height: 14, tintColor: '#888' },
  locationText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#888' },
  ticketBottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#1D2B64' },
  detailsButton: {
    flexDirection: 'row',
    backgroundColor: '#EEF0FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center'
  },
  detailsButtonText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1D2B64' },
  detailsArrow: { width: 14, height: 14, tintColor: '#1D2B64', marginLeft: 6 },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: '#999',
    fontSize: 16,
    marginTop: 40
  },
  refreshButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#1D2B64',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6
  },
  refreshIcon: { width: 28, height: 28, tintColor: '#fff' },
  header: {
    width: '100%',
    height: 180,
    backgroundColor: '#1B2B68',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    position: 'relative'
  },
  logo: {
    width: 300.26,
    height: 87,
    resizeMode: 'contain',
    top: 23,
    left: -10
  },
  headerIconLeft: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 60 : 40
  },
  headerIconRight: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 60 : 40
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#fff'
  },
  newStatusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#29D697',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 8,
    shadowColor: '#1B2B68',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5
  },
  newStatusText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Regular'
  },
  statusContainer: {
    position: 'absolute',
    top: 0,
    right: 15,
    backgroundColor: '#29D697',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    shadowColor: '#1B2B68',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    zIndex: 10
  },
  statusText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-regular'
  },
  imageOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255, 255, 255, 0.3)', // לבן שקוף
  zIndex: 5,
},
singleFilterWrapper: {
  marginTop: -20,
  marginBottom: 20,
  paddingHorizontal: 20, // כדי שיישב בקו של האלמנטים האחרים
  alignItems: 'flex-start', // מיושר שמאלה
  zIndex: 10
},
filterButton: {
  backgroundColor: '#FFC107', // צהוב
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 30,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2
},
filterButtonText: {
  fontFamily: 'Poppins-Regular',
  color: '#1D2B64',
  fontSize: 16
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalMenu: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 12,
  width: 250,
  elevation: 5,
},
menuItem: {
  paddingVertical: 12,
  borderBottomColor: '#ddd',
  borderBottomWidth: 1,
},
menuItemText: {
  fontSize: 16,
  color: '#1D2B64',
  textAlign: 'center',
  fontFamily: 'Poppins-Regular',
},
filterButtonContent: {
  flexDirection: 'row',
  alignItems: 'center', // שמירה על אמצע
  justifyContent: 'flex-start',
  overflow: 'visible',       // מונע חיתוך
  paddingVertical: 2,        // מוסיף רווח פנימי אנכי
},
filterButtonIcon: {
  width: 20,
  height: 20,
  resizeMode: 'contain',     // מוודא שהתמונה לא נמתחת או נחתכת
  marginRight: 8,
  marginLeft: 0,
},
});
