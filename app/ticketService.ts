// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ticket } from './types';

// export const fetchUnifiedTickets = async (): Promise<Ticket[]> => {
//   const token = await AsyncStorage.getItem('authToken');
//   const currentUserEmail = await AsyncStorage.getItem('userEmail');

//   const [internalRes, externalRes] = await Promise.all([
//     fetch(`https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/user-tickets?token=${token}`),
//     fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/my-transfers', {
//       headers: { Authorization: `Bearer ${token}` },
//     }),
//   ]);

//   const internalData = internalRes.ok ? await internalRes.json() : [];
//   const externalData = externalRes.ok ? await externalRes.json() : [];

//   console.log(internalData);
//   console.log(externalData);

//   const externalTickets: Ticket[] = externalData.map((t: any) => {
//     let status;



// if (!t.isConfirmed) {
//   status = 1; // Pending
// } else if (t.transferSource?.role === 'Seller') {
//   status = 0; //אם הפרטים שם של המוכר אז אתה הקונה
// } else {
//   status = 2; 
// }

//     return {
//       id: t.id,
//       price: t.price,
//       createdAt: t.createdAt,
//       status: status,
//       ownerId: '',
//       eventId: -1,
//       transactionId: null,
//       seatDescription: t.seatLocation,
//       isExternal: true,
//       ticketCount: t.ticketCount,
//       event: {
//         id: -1,
//         name: t.eventName,
//         date: t.dateTime,
//         location: t.location,
//         startTime: t.startTime,
//         gatesOpenTime: t.gatesOpenTime,
//         imageUrl: 'https://tickectexchange.blob.core.windows.net/ui-assets/default_background.png',
//         notes: t.additionalDetails,
//       },
//       transferSource: {
//         email: t.transferSource.email,
//         fullName: t.transferSource.fullName,
//         role: t.transferSource.role,
//         priceToPay: t.transferSource.priceToPay,
//       }
//     };
//   });

//   return [...internalData, ...externalTickets];
// };
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket } from './types';

export const fetchUnifiedTickets = async (): Promise<Ticket[]> => {
  const token = await AsyncStorage.getItem('authToken');

  const [internalRes, externalRes] = await Promise.all([
    fetch(`https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/user-tickets?token=${token}`),
    fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/my-transfers', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const internalData = internalRes.ok ? await internalRes.json() : [];
  const externalData = externalRes.ok ? await externalRes.json() : [];

  const defaultImage = 'https://tickectexchange.blob.core.windows.net/ui-assets/default_background.png';

  const externalTickets: Ticket[] = externalData.map((t: Ticket) => {
    return {
      ...t,
      event: {
        ...t.event,
        imageUrl: t.event?.imageUrl || defaultImage,
      },
    };
  });

  return [...internalData, ...externalTickets];
};