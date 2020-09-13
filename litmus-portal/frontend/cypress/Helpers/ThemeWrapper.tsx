// This Component will work as a Theme Wrapper for the required component. 

import React from 'react';
import withTheme from '../../src/theme';

interface ThemeWrapperProps {
  children?: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
}) => {

  return (
    <div>
        {children}
    </div>
  );
};

export default withTheme(ThemeWrapper);
