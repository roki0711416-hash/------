import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL;
const enableLiveReload = process.env.CAP_LIVE_RELOAD === '1';
const isIosReview = process.env.NEXT_PUBLIC_IOS_REVIEW === 'true';

// Default: never use dev server in production.
// Exception: iOS review builds can intentionally point WebView to a production-mode Next.js server.
const allowDevServer =
  enableLiveReload && (process.env.NODE_ENV !== 'production' || isIosReview);

const config: CapacitorConfig = {
  appId: 'com.slokasu.app',
  appName: 'slokasu',
  webDir: 'out',
  ...(allowDevServer && serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: true,
        },
      }
    : {}),
};

export default config;
