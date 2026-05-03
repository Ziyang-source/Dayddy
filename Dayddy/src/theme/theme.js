// Dayddy Design System — matches the Tailwind color config in the HTML files

export const Colors = {
  primary: '#7e5b64',
  primaryContainer: '#ffd1dc',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#66454e',
  primaryFixed: '#ffd1dc',
  primaryFixedDim: '#f0c3ce',
  primaryDim: '#714f58',
  onPrimaryFixed: '#52333c',
  onPrimaryFixedVariant: '#714e58',
  inversePrimary: '#ffd1dc',

  secondary: '#7b5f45',
  secondaryContainer: '#fed9b8',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#644b32',
  secondaryFixed: '#fed9b8',
  secondaryFixedDim: '#efcbab',
  secondaryDim: '#6d533a',
  onSecondaryFixed: '#503921',
  onSecondaryFixedVariant: '#6f553b',

  tertiary: '#626374',
  tertiaryContainer: '#e6e6fa',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#525464',
  tertiaryFixed: '#e6e6fa',
  tertiaryFixedDim: '#d8d8ec',
  tertiaryDim: '#565768',
  onTertiaryFixed: '#404251',
  onTertiaryFixedVariant: '#5c5e6e',

  surface: '#fffbff',
  surfaceBright: '#fffbff',
  surfaceDim: '#e7e6a9',
  surfaceVariant: '#ecebb2',
  surfaceTint: '#7e5b64',
  surfaceContainer: '#f8f6c3',
  surfaceContainerLow: '#fefccb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#f2f1ba',
  surfaceContainerHighest: '#ecebb2',
  onSurface: '#39391b',
  onSurfaceVariant: '#666643',
  inverseSurface: '#0f0f00',
  inverseOnSurface: '#a09f78',

  background: '#fffbff',
  onBackground: '#39391b',

  outline: '#83835d',
  outlineVariant: '#bdbb92',

  error: '#c12048',
  errorContainer: '#f74b6d',
  errorDim: '#a70138',
  onError: '#ffffff',
  onErrorContainer: '#510017',
};

export const FontFamily = {
  headline: 'PlusJakartaSans-ExtraBold',
  headlineBold: 'PlusJakartaSans-Bold',
  headlineSemiBold: 'PlusJakartaSans-SemiBold',
  body: 'BeVietnamPro-Regular',
  bodyMedium: 'BeVietnamPro-Medium',
  bodySemiBold: 'BeVietnamPro-SemiBold',
  bodyBold: 'BeVietnamPro-Bold',
};

export const Radius = {
  sm: 8,
  md: 16,   // DEFAULT
  lg: 24,   // lg
  xl: 32,   // xl
  full: 9999,
};

export const Shadow = {
  soft: {
    shadowColor: '#39391b',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  medium: {
    shadowColor: '#39391b',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
};