'use client';

import { createContext, useContext } from 'react';

interface BusinessContextType {
  name?: string;
  logoUrl?: string | null;
  slug?: string;
}

const BusinessContext = createContext<BusinessContextType>({});

export function BusinessProvider({
  children,
  business,
}: {
  children: React.ReactNode;
  business: BusinessContextType;
}) {
  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}


