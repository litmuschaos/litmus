import type { ForwardedRef } from 'react';

export const setForwardedRef = <T>(ref: ForwardedRef<T>, value: T): void => {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
};
