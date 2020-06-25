export interface Theme {
	isDarkTheme: boolean;
}

export enum ThemeActions {
	TOGGLE_THEME = "TOGGLE_THEME",
}

interface ThemeActionType<T> {
	type: T;
}

export type ThemeAction = ThemeActionType<typeof ThemeActions.TOGGLE_THEME>;
