import { useContext } from 'react';
import { AppContext } from './appContextValue';

/**
 * Hook to access the global app context.
 * Must be used within an <AppProvider>.
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp() must be used inside <AppProvider>');
  }
  return ctx;
}
