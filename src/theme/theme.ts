import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  background: '#F5F2E9',
  backgroundRaised: '#FFFDF8',
  surface: '#EDEAE7',
  surfaceBorder: '#DAD3CE',
  text: '#1A1A1A',
  muted: '#636363',
  accent: '#9F4022',
  accentPressed: '#7A311A',
  accentInk: '#FFFFFF',
  danger: '#9F4022',
  dangerSurface: '#F6E7E0',
  dangerBorder: '#C77A62',
  warning: '#516834',
  warningSurface: '#EDF0E7',
  white: '#FFFFFF',
  ink: '#1A1A1A',
  teal: '#619FA3',
  lime: '#F0FF00',
  night: '#172522',
  nightRaised: '#20332F',
  onDark: '#FFFDF8',
  onDarkMuted: '#C4D0CA',
  glass: 'rgba(255, 253, 248, 0.10)',
  glassBorder: 'rgba(255, 253, 248, 0.22)',
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const type = {
  display: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.4,
  } satisfies TextStyle,
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } satisfies TextStyle,
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.4,
  } satisfies TextStyle,
};

export const shadow: ViewStyle = Platform.select({
  web: { boxShadow: '0 18px 45px rgba(56, 39, 24, 0.10)' },
  default: {
    shadowColor: '#4B3727',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
}) ?? {};
