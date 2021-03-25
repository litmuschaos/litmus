import React from 'react';
import Scaffold from '../../containers/layouts/Scaffold';
import LandingHome from '../../views/Home/LandingHome';

const HomePage: React.FC = () => {
  return (
    <Scaffold>
      <LandingHome />
    </Scaffold>
  );
};

export default HomePage;
