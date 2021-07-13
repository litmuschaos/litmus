import React from 'react';
import Breadcrumb from '../../../components/BreadCrumbs';

const Wrapper: React.FC = ({ children }) => {
  return (
    <>
      <Breadcrumb />
      {children}
    </>
  );
};

export default Wrapper;
