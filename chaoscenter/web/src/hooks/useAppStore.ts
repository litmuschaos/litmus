import { useContext } from 'react';
import { AppStoreContext, AppStoreContextProps } from '@context';

export function useAppStore(): AppStoreContextProps {
  return useContext(AppStoreContext);
}
