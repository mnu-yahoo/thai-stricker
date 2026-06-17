export type AppThemeName = "light" | "dark";

export type AppTheme = {
  name: AppThemeName;
  colors: {
    appBackground: string;
    surface: string;
    surfaceMuted: string;
    card: string;
    cardElevated: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryPressed: string;
    primaryText: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    navbarBackground: string;
    navbarActive: string;
    navbarInactive: string;
    inputBackground: string;
    inputBorder: string;
  };
};

export const lightTheme: AppTheme = {
  name: "light",
  colors: {
    // Placeholder values until Google Stitch final tokens are provided.
    appBackground: "#f5f2ec",
    surface: "#fffaf3",
    surfaceMuted: "#f3eadf",
    card: "#fffaf3",
    cardElevated: "#ffffff",
    textPrimary: "#211d18",
    textSecondary: "#5f5446",
    textMuted: "#8b7d6b",
    border: "#e3d8c8",
    primary: "#b85a27",
    primaryPressed: "#9f4d1f",
    primaryText: "#fffaf3",
    accent: "#8b5e34",
    success: "#2f855a",
    warning: "#d69e2e",
    danger: "#c53030",
    navbarBackground: "#fffaf3",
    navbarActive: "#b85a27",
    navbarInactive: "#6b5f51",
    inputBackground: "#fffdf8",
    inputBorder: "#ccbca6",
  },
};

export const darkTheme: AppTheme = {
  name: "dark",
  colors: {
    // Placeholder values until Google Stitch final tokens are provided.
    appBackground: "#15181b",
    surface: "#1d2328",
    surfaceMuted: "#252c32",
    card: "#1f262c",
    cardElevated: "#263039",
    textPrimary: "#f3efe6",
    textSecondary: "#d0c6b7",
    textMuted: "#a79b8b",
    border: "#36424b",
    primary: "#d17a43",
    primaryPressed: "#bc6835",
    primaryText: "#fff7f0",
    accent: "#e2a261",
    success: "#4daf7c",
    warning: "#e3b248",
    danger: "#df6b63",
    navbarBackground: "#1b2126",
    navbarActive: "#d17a43",
    navbarInactive: "#b8afa3",
    inputBackground: "#242c33",
    inputBorder: "#43505b",
  },
};

export function getTheme(themePreference: "Light" | "Dark"): AppTheme {
  return themePreference === "Light" ? lightTheme : darkTheme;
}
