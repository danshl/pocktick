import React, { createContext, useContext, useState } from 'react';

import type { Ticket } from './types';

type UserDataContextType = {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
};
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  return (
    <UserDataContext.Provider value={{ tickets, setTickets }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};