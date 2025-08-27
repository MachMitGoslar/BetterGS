import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.goslar.machmit.betterGS',
  appName: 'betterGS',
  webDir: 'www',
  ios: {
    scheme: 'BetterGS',
    handleApplicationNotifications: true,
  }

};

export default config;
