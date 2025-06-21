// api/transferApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initiateTicketTransfer = async (
  ticketIds: number[],
  buyerEmail: string,
  price: number,
  comment: string
): Promise<{ success: boolean; message?: string }> => {
  const token = await AsyncStorage.getItem('authToken');

  const response = await fetch(
    'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/transfer/initiate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ticketIds,
        buyerEmail,
        price,
        comment,
      }),
    }
  );

  const responseText = await response.text();

  if (response.ok) {
    return { success: true };
  } else {
    try {
      const json = JSON.parse(responseText);
      return { success: false, message: json?.message || 'Transfer failed.' };
    } catch {
      return { success: false, message: responseText || 'Transfer failed.' };
    }
  }
};