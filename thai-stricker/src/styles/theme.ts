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
  typography: {
    fontFamilyRegular: string;
    fontFamilyMedium: string;
    fontFamilyBold: string;
    titleSize: number;
    subtitleSize: number;
    bodySize: number;
    captionSize: number;
    buttonSize: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  controls: {
    buttonHeight: number;
    inputHeight: number;
    cardPadding: number;
    navbarHeight: number;
  };
  imagery: {
    iconStyle: string;
    imageStyle: string;
  };
};

const stitchSharedTypography = {
  fontFamilyRegular: "Archivo Narrow",
  fontFamilyMedium: "Archivo Narrow",
  fontFamilyBold: "Archivo Narrow",
  titleSize: 32,
  subtitleSize: 24,
  bodySize: 16,
  captionSize: 12,
  buttonSize: 12,
} as const;

const stitchSharedSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const stitchSharedRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  pill: 999,
} as const;

const stitchSharedControls = {
  // Derived from the current Stitch guidance: 16px card padding, dense controls, 48px touch target.
  buttonHeight: 48,
  inputHeight: 48,
  cardPadding: 16,
  navbarHeight: 56,
} as const;

const stitchSharedImagery = {
  iconStyle: "bold outlined performance icons",
  imageStyle: "premium disciplined training photography",
} as const;

export const lightTheme: AppTheme = {
  name: "light",
  colors: {
    appBackground: "#F9F9F9",
    surface: "#FFFFFF",
    surfaceMuted: "#F8FAFC",
    card: "#FFFFFF",
    cardElevated: "#F8FAFC",
    textPrimary: "#1A1A1A",
    textSecondary: "#4A4A4A",
    textMuted: "#8C8C8C",
    border: "#E0E0E0",
    primary: "#C00018",
    primaryPressed: "#93000F",
    primaryText: "#FFFFFF",
    accent: "#2D9CDB",
    success: "#00875D",
    warning: "#F2994A",
    danger: "#EB5757",
    navbarBackground: "#FFFFFF",
    navbarActive: "#C00018",
    navbarInactive: "#4A4A4A",
    inputBackground: "#FFFFFF",
    inputBorder: "#E0E0E0",
  },
  typography: stitchSharedTypography,
  spacing: stitchSharedSpacing,
  radius: stitchSharedRadius,
  controls: stitchSharedControls,
  imagery: stitchSharedImagery,
};

export const darkTheme: AppTheme = {
  name: "dark",
  colors: {
    appBackground: "#131315",
    surface: "#131315",
    surfaceMuted: "#201F21",
    card: "#201F21",
    cardElevated: "#2A2A2C",
    textPrimary: "#E5E1E4",
    textSecondary: "#B9CACB",
    textMuted: "#849495",
    border: "#3B494B",
    primary: "#00F0FF",
    primaryPressed: "#00DBE9",
    primaryText: "#002022",
    accent: "#7DF4FF",
    success: "#4CAF50",
    warning: "#FF9800",
    danger: "#FF6B7A",
    navbarBackground: "#131315",
    navbarActive: "#00F0FF",
    navbarInactive: "#849495",
    inputBackground: "#1C1B1D",
    inputBorder: "#3B494B",
  },
  typography: stitchSharedTypography,
  spacing: stitchSharedSpacing,
  radius: stitchSharedRadius,
  controls: stitchSharedControls,
  imagery: stitchSharedImagery,
};

export function getTheme(themePreference: "Light" | "Dark"): AppTheme {
  return themePreference === "Light" ? lightTheme : darkTheme;
}
