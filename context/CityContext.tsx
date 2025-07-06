import React, { createContext, useContext, useState, ReactNode } from 'react';

type CityContextType = {
  cities: string[];
  addCity: (city: string) => void;
};

const CityContext = createContext<CityContextType>({
  cities: [],
  addCity: () => {},
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<string[]>([]);
  const addCity = (city: string) => {
    setCities(prev => prev.includes(city) ? prev : [...prev, city]);
  };
  return (
    <CityContext.Provider value={{ cities, addCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  return useContext(CityContext);
} 