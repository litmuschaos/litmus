import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import * as React from 'react';

// Agument the Theme interface
declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    // newProperty: {
    // 	key: value;
    // }
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    // newProperty?: {
    // 	key?: value;
    // }
  }
}

// Augument the Palette interface
declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    customColors: {
      white: (opacity: number) => string;
      black: (opacity: number) => string;
    };
  }
  // allow configuration using `createMuiTheme`
  interface PaletteOptions {
    customColors?: {
      white?: (opacity: number) => string;
      black?: (opacity: number) => string;
    };
  }
}
function customTheme(options: ThemeOptions) {
  return createMuiTheme({
    palette: {
      primary: {
        light: '#2CCA8F',
        main: '#2CCA8F',
        dark: '#109B67',
        contrastText: '#000000',
      },
      secondary: {
        light: '#858CDD',
        main: '#858CDD',
        dark: '#5B44BA',
        contrastText: '#FFFFFF',
      },
      error: {
        light: 'rgba(255, 0, 0, 0.1)',
        main: '#BA3B34',
        dark: '#CA2C2C',
      },
      warning: {
        main: '#F6B92B',
      },
      background: {
        paper: '#FBFCFD',
        default: '#FAFBFD',
      },
      text: {
        primary: 'rgba(0, 0, 0)',
        secondary: 'rgba(0, 0, 0, 0.88)',
        disabled: 'rgba(0, 0, 0, 0.4)',
        hint: 'rgba(0, 0, 0, 0.2)',
      },
      customColors: {
        white: (opacity: number): string => {
          let op = opacity;
          if (op < 0) op = 0;
          if (op > 100) op = 100;
          return `rgba(255, 255, 255, ${op})`;
        },
        black: (opacity: number): string => {
          let op = opacity;
          if (op < 0) op = 0;
          if (op > 100) op = 100;
          return `rgba(0, 0, 0, ${op})`;
        },
      },
    },
    typography: {
      fontSize: 12,
      fontFamily: 'Ubuntu',
    },
    ...options,
  });
}

const theme = customTheme({
  overrides: {
    MuiSlider: {
      thumb: {
        opacity: 0,
      },
      mark: {
        marginLeft: -6.8,
        backgroundImage: `url(${'./icons/arrow.svg'})`,
        backgroundColor: 'none',
        '&[data-index="9"]': {
          backgroundImage: 'none',
        },
      },
      markActive: {
        backgroundImage: `url(${'./icons/arrow.svg'})`,
        backgroundColor: 'none',
      },
      markLabel: {
        fontFamily: 'Ubuntu',
        fontSize: 15,
        marginTop: -5,
        marginLeft: -45,
        color: 'rgba(0, 0, 0, 0.4)',
      },
      markLabelActive: {
        fontFamily: 'Ubuntu',
        fontSize: 15,
        color: '#FFFFFF',
      },
    },
    MuiFormLabel: {
      root: {
        paddingLeft: 20,
        '&[data-shrink="true"]': {
          color: '#5B44BA',
        },
      },
      asterisk: {
        color: 'transparent',
      },
    },
  },
});

const withTheme = (Component: any) => {
  function WithTheme(props: object) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...props} />
      </ThemeProvider>
    );
  }

  return WithTheme;
};

export default withTheme;
