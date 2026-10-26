import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Fallback } from './Fallback';

interface ParentComponentErrorWrapperProps {
  children: React.ReactNode | undefined;
}

export function ParentComponentErrorWrapper({ children }: ParentComponentErrorWrapperProps): React.ReactElement {
  return children ? <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary> : <></>;
}
