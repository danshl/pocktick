export type Ticket = {
  id: number;
  price: number;
  createdAt: string;
  status: number;
  ownerId: number;
  eventId: number;
  transactionId?: number; // ✅ הוסף את זה
  seatDescription: string,
event: {
  id: number;
  name: string;
  date: string;
  location: string;
  startTime: string;
  gatesOpenTime: string;
  notes?: string;
  imageUrl: string;
};

  transferSource: {
    fullName: string;
    email: string;
  } | null;
};