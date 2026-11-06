const { existsSync } = require('node:fs');

const androidServices = './google-services.json';
const iosServices = './GoogleService-Info.plist';
const hasNativeGoogleConfig = existsSync(androidServices) && existsSync(iosServices);

const config = {
  name: 'HBPlus Auth',
  slug: 'hbplus-auth',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'hbplusauth',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'fit.hbplus.auth',
    ...(existsSync(iosServices) ? { googleServicesFile: iosServices } : {}),
  },
  android: {
    package: 'fit.hbplus.auth',
    predictiveBackGestureEnabled: false,
    ...(existsSync(androidServices) ? { googleServicesFile: androidServices } : {}),
    adaptiveIcon: {
      backgroundColor: '#07141C',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
    ...(hasNativeGoogleConfig ? ['@react-native-google-signin/google-signin'] : []),
  ],
  extra: {
    officialEmailDomain: 'hbplus.fit',
  },
};

module.exports = config;
