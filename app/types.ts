// types.ts

export type Ticket = {
  id: number;
  price: number;
  createdAt: string;
  status: number;
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
};