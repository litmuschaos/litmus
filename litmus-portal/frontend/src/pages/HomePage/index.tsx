import React, { useState } from 'react';
import Scaffold from '../../containers/layouts/Scaffold';
import LandingHome from '../../views/Home/LandingHome';
import ReturningHome from '../../views/Home/ReturningHome';

const HomePage: React.FC = () => {
  const [dataPresent, setDataPresent] = useState<boolean>(true);

  return (
    <Scaffold>
      {dataPresent ? (
        <ReturningHome
          callbackToSetDataPresent={(dataPresent: boolean) => {
            setDataPresent(dataPresent);
          }}
          currentStatus={dataPresent}
        />
      ) : (
        <LandingHome />
      )}
    </Scaffold>
  );
};

export default HomePage;
