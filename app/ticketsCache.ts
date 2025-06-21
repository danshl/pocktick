
import { Ticket } from './types';

let cachedTickets: Ticket[] = [];

export const getCachedTickets = () => cachedTickets;

export const setCachedTickets = (tickets: Ticket[]) => {
  cachedTickets = tickets;
};