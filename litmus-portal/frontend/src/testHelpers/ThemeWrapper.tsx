// This Component will work as a Theme Wrapper for the component to be tested.
import { LitmusThemeProvider } from 'litmus-ui';
import React from 'react';

interface ThemeWrapperProps {
  children?: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  return <LitmusThemeProvider>{children}</LitmusThemeProvider>;
};

export default ThemeWrapper;
