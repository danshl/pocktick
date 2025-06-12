// /services/ticketService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function fetchTickets() {
  console.log("fetching tickets...")
  const token = await AsyncStorage.getItem('authToken');
  console.log("s",token,"s")
  if (!token) throw new Error('No token found');

  const response = await fetch(
    `https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/tickets/user-tickets?token=${token}`
  );

  if (!response.ok) throw new Error('Failed to fetch tickets');
  
  const data = await response.json();
  console.log("response:",data);
  return data;
}