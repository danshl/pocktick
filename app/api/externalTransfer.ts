// src/api/externalTransfer.ts
import { Platform } from 'react-native';

export async function submitExternalTransfer(form: {
  eventName: string;
  seatLocation: string;
  dateTime: string;
  additionalDetails: string;
  ticketCount: string;
  buyerEmail: string;
  price: string;
  location: string;
  startTime: string;
  gatesOpenTime: string;
  fileUris: string[];
  token: string;
}) {
  const {
    eventName,
    seatLocation,
    dateTime,
    additionalDetails,
    ticketCount,
    buyerEmail,
    price,
    location,
    startTime,
    gatesOpenTime,
    fileUris,
    token,
  } = form;

  const formData = new FormData();

  formData.append('eventName', eventName);
  formData.append('seatLocation', seatLocation);
  formData.append('dateTime', dateTime);
  formData.append('additionalDetails', additionalDetails || '');
  formData.append('ticketCount', ticketCount);
  formData.append('buyerEmail', buyerEmail);
  formData.append('price', price);
  formData.append('location', location);
  formData.append('startTime', startTime);
  formData.append('gatesOpenTime', gatesOpenTime);

  fileUris.forEach((uri, index) => {
    formData.append('ticketFiles', {
      uri,
      name: `ticket-${index + 1}.jpg`,
      type: 'image/jpeg',
    } as any);
  });

  const res = await fetch(
    'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/external-transfer/submit',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to submit transfer.');
  }

  return await res.json();
}
