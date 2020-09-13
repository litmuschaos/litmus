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
      gray: string;
      menuOption: {
        active: string;
      };
    };
    input: {
      disabled: string;
    };
    shadow: {
      blue: string;
    };
    editorBackground: string;
    resilienceScore: string;
    graphAnnotationsColor: string;
    graphHoverColors: {
      passedTests: string;
      failedTests: string;
    };
  }
  // allow configuration using `createMuiTheme`
  interface PaletteOptions {
    customColors?: {
      white?: (opacity: number) => string;
      black?: (opacity: number) => string;
      gray?: string;
      menuOption?: {
        active?: string;
      };
    };
    input?: {
      disabled?: string;
    };
    shadow?: {
      blue: string;
    };
    editorBackground?: string;
    resilienceScore?: string;
    graphAnnotationsColor?: string;
    graphHoverColors?: {
      passedTests: string;
      failedTests: string;
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
        dark: '#EB5757',
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
      input: {
        disabled: '#e2e2e1',
      },
      shadow: {
        blue: 'rgba(91, 68, 186, 0.25)',
      },
      customColors: {
        white: (opacity: number): string => {
          let op = opacity;
          if (op < 0) op = 0;
          if (op > 1) op = 1;
          return `rgba(255, 255, 255, ${op})`;
        },
        black: (opacity: number): string => {
          let op = opacity;
          if (op < 0) op = 0;
          if (op > 1) op = 1;
          return `rgba(0, 0, 0, ${op})`;
        },
        gray: '#5D6173',
        menuOption: {
          active: 'rgba(16, 155, 103, 0.1)',
        },
      },
      editorBackground: '#1C1C1C',
      resilienceScore: '#F6B92B',
      graphAnnotationsColor: 'rgb(204,204,204)',
      graphHoverColors: {
        passedTests: 'rgba(16, 155, 103, 0.2)',
        failedTests: 'rgba(202, 44, 44, 0.2)',
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
