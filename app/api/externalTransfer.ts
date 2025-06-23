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
  formData.append('additionalDetails', additionalDetails || 'No comments');
  formData.append('ticketCount', ticketCount);
  formData.append('buyerEmail', buyerEmail);
  formData.append('price', price);
  formData.append('location', location);
  formData.append('startTime', startTime);
  formData.append('gatesOpenTime', gatesOpenTime);

fileUris.forEach((uri, index) => {
  const uriParts = uri.split('/');
  const filename = uriParts[uriParts.length - 1];
  const extension = filename?.split('.').pop()?.toLowerCase() || 'jpg';

  let type = 'application/octet-stream';
  if (extension === 'pdf') type = 'application/pdf';
  else if (['jpg', 'jpeg'].includes(extension)) type = 'image/jpeg';
  else if (extension === 'png') type = 'image/png';
  else if (extension === 'webp') type = 'image/webp';

  formData.append('ticketFiles', {
    uri,
    name: filename,
    type,
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
