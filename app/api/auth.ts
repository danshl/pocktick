export async function changePassword(currentPassword: string, newPassword: string, token: string) {
  const response = await fetch(
    'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/change-password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to change password');
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, message: data?.message || 'Unknown error occurred.' };
    }
  } catch (error) {
    return { success: false, message: 'Something went wrong. Please try again later.' };
  }
}

const BASE_URL = 'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net';

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    // נזרוק שגיאה שתכיל גם את הקוד וגם את ההודעה
    const error = new Error(result.message || 'Login failed') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return result;
}
 
export async function registerUser({
  email,
  fullName,
  password,
  phoneNumber,
}: {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
}) {
  const response = await fetch(`${BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      fullName,
      passwordHash: password,  
      PhoneNumber: phoneNumber,  
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || 'Registration failed') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return result;
}
