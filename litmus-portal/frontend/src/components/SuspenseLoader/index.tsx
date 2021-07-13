import React, { Suspense } from 'react';
import Center from '../../containers/layouts/Center';
import Loader from '../Loader';

interface SuspenseLoaderProps {
  style?: Object;
}

export const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  children,
  style,
}) => {
  return (
    <Suspense
      fallback={
        <div style={style ?? {}}>
          <Center>
            <Loader />
          </Center>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
