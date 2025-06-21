import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket } from './types';
import { setCachedTickets } from './ticketsCache';

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
  const allTickets = [...internalData, ...externalTickets];
    setCachedTickets(allTickets); 
    return allTickets;
};