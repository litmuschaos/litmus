import { CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { ThemeOptions } from "@material-ui/core/styles/createMuiTheme";
import * as React from "react";

// Agument the Theme interface
declare module "@material-ui/core/styles/createMuiTheme" {
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
declare module "@material-ui/core/styles/createPalette" {
	interface Palette {
		// newProperty: {
		// 	key: value;
		// }
	}
	// allow configuration using `createMuiTheme`
	interface PaletteOptions {
		// newProperty?: {
		// 	key?: value;
		// }
	}
}
function customTheme(options: ThemeOptions) {
	return createMuiTheme({
		palette: {
			primary: {
				light: "#2CCA8F",
				main: "#2CCA8F",
				dark: "#109B67",
				contrastText: "#000000",
			},
			secondary: {
				light: "#858CDD",
				main: "#858CDD",
				dark: "#5B44BA",
				contrastText: "#FFFFFF",
			},
			background: {
				paper: "#FBFCFD",
				default: "#FAFBFD",
			},
			text: {
				primary: "rgba(0, 0, 0)",
				secondary: "rgba(0, 0, 0, 0.88)",
				disabled: "rgba(0, 0, 0, 0.4)",
				hint: "rgba(0, 0, 0, 0.2)",
			},
		},
		typography: {
			fontSize: 12,
		},
		...options,
	});
}

const theme = customTheme({});

export default function withTheme(Component: any) {
	function WithTheme(props: object) {
		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...props} />
			</ThemeProvider>
		);
	}

	return WithTheme;
}
