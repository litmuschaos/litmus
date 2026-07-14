import React from 'react';

import { StringsContext, StringsContextValue, StringsMap } from './StringsContext';

export interface StringsContextProviderProps extends Pick<StringsContextValue, 'getString'> {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialStrings?: Record<string, any>; // temp prop for backward compatability
}

export function StringsContextProvider(props: StringsContextProviderProps): React.ReactElement {
  return (
    <StringsContext.Provider
      value={{
        data: {
          ...(props.initialStrings as StringsMap)
        },
        getString: props.getString
      }}
    >
      {props.children}
    </StringsContext.Provider>
  );
}
