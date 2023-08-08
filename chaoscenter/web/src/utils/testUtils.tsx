/* eslint-disable no-restricted-imports */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StringsContext } from '@strings';
import strings from 'strings/strings.en.yaml';
import '../bootstrap.scss';

export const findDialogContainer = (): HTMLElement | null => document.querySelector('.bp3-dialog');
export const findPopoverContainer = (): HTMLElement | null => document.querySelector('.bp3-popover-content');

export function TestWrapper({ children }: { children: React.ReactElement }): React.ReactElement {
  const getString = (key: string): string => key;

  return (
    <BrowserRouter>
      <StringsContext.Provider value={{ data: strings as any, getString }}>{children}</StringsContext.Provider>
    </BrowserRouter>
  );
}
