import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Initialize Firebase Crashlytics
 * This should be called early in the app lifecycle
 */
export const initializeCrashlytics = async () => {
  try {
    // Enable Crashlytics collection
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    
    console.log('Firebase Crashlytics initialized successfully');
  } catch (error) {
    console.error('Error initializing Crashlytics:', error);
  }
};

/**
 * Log a custom error to Crashlytics
 */
export const logError = (error: Error, context?: string) => {
  if (context) {
    crashlytics().log(`Error in ${context}`);
  }
  crashlytics().recordError(error);
};

/**
 * Set user identifier for crash reports
 */
export const setCrashlyticsUserId = (userId: string) => {
  crashlytics().setUserId(userId);
};

/**
 * Set custom attributes for crash reports
 */
export const setCrashlyticsAttribute = (key: string, value: string) => {
  crashlytics().setAttribute(key, value);
};

/**
 * Log custom message to Crashlytics
 */
export const logCrashlyticsMessage = (message: string) => {
  crashlytics().log(message);
};

/**
 * Force a test crash (only for testing)
 */
export const testCrash = () => {
  crashlytics().crash();
};

export default crashlytics;
