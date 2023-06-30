import React from 'react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function Fallback({ error, resetErrorBoundary }: FallbackProps): React.ReactElement {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function EmptyFallback(): React.ReactElement {
  return <></>;
}
