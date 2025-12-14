import { crashLogger } from '../../utils/crashlytics';

/**
 * Initialize Firebase Crashlytics
 * This should be called early in the app lifecycle
 * Now uses the fallback-compatible crashLogger
 */
export const initializeCrashlytics = async () => {
  console.log('Firebase Crashlytics initialization handled by crashLogger');
};

/**
 * Log a custom error to Crashlytics
 */
export const logError = (error: Error, context?: string) => {
  crashLogger.logError(error, context);
};

/**
 * Set user identifier for crash reports
 */
export const setCrashlyticsUserId = (userId: string) => {
  crashLogger.setUserContext(userId);
};

/**
 * Set custom attributes for crash reports
 */
export const setCrashlyticsAttribute = (key: string, value: string) => {
  console.log(`[Crashlytics] Attribute: ${key} = ${value}`);
};

/**
 * Log custom message to Crashlytics
 */
export const logCrashlyticsMessage = (message: string) => {
  crashLogger.setBreadcrumb(message);
};

/**
 * Force a test crash (only for testing)
 */
export const testCrash = () => {
  console.warn('[Crashlytics] Test crash called - only works in native builds');
};

export default crashLogger;
