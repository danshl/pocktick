// api/sellerApi.ts
export const getSellerVerificationStatus = async (token: string) => {
  const res = await fetch(
    'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/sellerverification/status',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error('Failed to check verification status');
  const data = await res.json();
  return data.status?.toLowerCase();
};
