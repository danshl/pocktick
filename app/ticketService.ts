import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket } from './types';

export const fetchUnifiedTickets = async (): Promise<Ticket[]> => {
  const token = await AsyncStorage.getItem('authToken');
  const currentUserEmail = await AsyncStorage.getItem('userEmail');
  const [internalRes, externalRes] = await Promise.all([
   fetch(`https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/user-tickets?token=${token}`),
    fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/my-transfers', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const internalData = internalRes.ok ? await internalRes.json() : [];
  const externalData = externalRes.ok ? await externalRes.json() : [];
  console.log(internalData);
  console.log(externalData);
 
// 🧠 מבנה מחדש את הכרטיסים החיצוניים שיתאימו לממשק Ticket
const externalTickets: Ticket[] = externalData.map((t: any) => {
  let status;
  if (t.isConfirmed === false) {
    status = 1; // Pending
  } else if (t.buyerEmail?.toLowerCase() === currentUserEmail?.toLowerCase()) {
    status = 0; // Active
  } else {
    status = 2; // Transferred
  }
  console.log(t.buyerEmail);
  console.log(t.sellerEmail);
  console.log(currentUserEmail);
  return {
    id: t.id,
    price: t.price, // ברירת מחדל
    createdAt: t.createdAt,
    status: status,
    ownerId: "",
    eventId: -1, // מזהה פיקטיבי
    transactionId: null,
    seatDescription: t.seatLocation,
    isExternal: true, // שדה מותאם
    ticketCount: t.ticketCount,
    event: {
      id: -1,
      name: t.eventName,
      date: t.dateTime,
      location: t.location,
      startTime: t.startTime,
      gatesOpenTime: t.gatesOpenTime,
      imageUrl: 'https://tickectexchange.blob.core.windows.net/ui-assets/default_background.png', // יהיה דיפולט בתצוגה
      notes: t.additionalDetails,
    },
transferSource:
  t.buyerEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
    ? {
        email: t.sellerEmail,
        fullName: 'Seller', // אפשר גם לשלוף שם מהשרת בהמשך
      }
    : null,
  };
});

  return [...internalData, ...externalTickets];
};