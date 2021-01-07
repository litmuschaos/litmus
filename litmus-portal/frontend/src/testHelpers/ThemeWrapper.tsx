// This Component will work as a Theme Wrapper for the component to be tested.
import { KuberaThemeProvider } from 'kubera-ui';
import React from 'react';

interface ThemeWrapperProps {
  children?: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  return (
    <KuberaThemeProvider platform="litmus-portal">
      {children}
    </KuberaThemeProvider>
  );
};

export default ThemeWrapper;
