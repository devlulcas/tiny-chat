import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/use-local-storage';

const AppConfigContext = createContext({
  username: '',
  setUsername: (name: string) => {
    console.error(`setUserName not implemented - cannot set ${name}`);
  },
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useLocalStorage<string>('username', '');

  return (
    <AppConfigContext.Provider value={{ username, setUsername }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext);

  if (!ctx) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }

  return ctx;
}
