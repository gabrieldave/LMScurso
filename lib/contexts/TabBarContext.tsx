import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabBarContextType {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export function TabBarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <TabBarContext.Provider value={{ isVisible, setVisible: setIsVisible }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarContext);
  if (context === undefined) {
    // Retornar valores por defecto en lugar de lanzar error para evitar romper la app
    console.warn('useTabBarVisibility used outside TabBarProvider, using default values');
    return { isVisible: true, setVisible: () => {} };
  }
  return context;
}

