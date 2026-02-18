import React from 'react';
import { useStrings } from '@strings';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function Fallback({ error, resetErrorBoundary }: FallbackProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <div role="alert">
      <p>{getString('error')}:</p>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
      <button onClick={resetErrorBoundary}>{getString('tryAgain')}</button>
    </div>
  );
}

export function EmptyFallback(): React.ReactElement {
  return <></>;
}
