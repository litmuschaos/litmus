// TODO: This is a test component and will be removed later
import React, { useState } from 'react';
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary';
import { Fallback } from '@errors';

function SimpleCounter(): React.ReactElement {
  const [count, setCount] = useState<number>(0);
  const throwError = useErrorHandler();

  const handleClick = (): void => {
    setTimeout(() => {
      throwError(new Error('Set Timeout Crashed'));
    }, 2000);

    setCount(prev => {
      prev = prev + 1;
      if (prev === 3) {
        throw new Error('Counter Crashed');
      }
      return prev;
    });
  };

  return <h1 onClick={handleClick}>{count}</h1>;
}

export default function ErrorCheckView(): React.ReactElement {
  return (
    <div>
      <p>
        <b>
          This is an example of error boundaries in React 16.
          <br />
          <br />
          Click on the numbers to increase the counters.
          <br />
          The counter is programmed to throw when it reaches 3. This simulates a JavaScript error in a component.
        </b>
      </p>
      <hr />
      <ErrorBoundary FallbackComponent={Fallback}>
        <p>
          These two counters are inside the same error boundary. If one crashes, the error boundary will replace both of
          them.
        </p>
        <SimpleCounter />
        <SimpleCounter />
      </ErrorBoundary>
      <hr />
      <p>
        These two counters are each inside of their own error boundary. So if one crashes, the other is not affected.
      </p>
      <ErrorBoundary FallbackComponent={Fallback}>
        <SimpleCounter />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={Fallback}>
        <SimpleCounter />
      </ErrorBoundary>
    </div>
  );
}
