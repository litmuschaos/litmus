import React from 'react';

import type { StringsMap } from './types';

export type StringKeys = keyof StringsMap;

export type { StringsMap };

export interface StringsContextValue {
  data: StringsMap;
  getString?(key: StringKeys, vars?: Record<string, any>): string;
}

export const StringsContext = React.createContext<StringsContextValue>({} as StringsContextValue);

export function useStringsContext(): StringsContextValue {
  return React.useContext(StringsContext);
}
