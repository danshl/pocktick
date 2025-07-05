export const getUserProfile = async (token: string) => {
  const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch user profile');
  return await res.json();
};

export const requestAccountDeletion = async (token: string) => {
  console.log("s");
  const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/request-delete', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to request deletion');
  //console.log(data);
  return data;
};

export const confirmAccountDeletion = async (token: string, code: string) => {
  const res = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/confirm-delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to confirm deletion');
  }

  return true;
};
