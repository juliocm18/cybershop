/**
 * Helper functions for using Crashlytics throughout the app
 * Import these functions wherever you need to log errors or track user actions
 */

import { 
  logError, 
  setCrashlyticsUserId, 
  setCrashlyticsAttribute, 
  logCrashlyticsMessage 
} from '../config/firebase';

/**
 * Wrapper for try-catch blocks that automatically logs to Crashlytics
 * 
 * @example
 * await withCrashlytics(
 *   async () => {
 *     // Your async code here
 *     await someAsyncOperation();
 *   },
 *   'MyComponent.handleSubmit'
 * );
 */
export const withCrashlytics = async <T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    logError(error, context);
    throw error;
  }
};

/**
 * Log a screen view to Crashlytics
 * Call this in useEffect when a screen mounts
 * 
 * @example
 * useEffect(() => {
 *   logScreenView('HomeScreen');
 * }, []);
 */
export const logScreenView = (screenName: string) => {
  setCrashlyticsAttribute('current_screen', screenName);
  logCrashlyticsMessage(`User viewed ${screenName}`);
};

/**
 * Log a user action to Crashlytics
 * 
 * @example
 * logUserAction('button_clicked', 'checkout_button');
 */
export const logUserAction = (action: string, details?: string) => {
  const message = details 
    ? `User action: ${action} - ${details}` 
    : `User action: ${action}`;
  logCrashlyticsMessage(message);
};

/**
 * Log an API error with additional context
 * 
 * @example
 * try {
 *   await api.fetchData();
 * } catch (error) {
 *   logApiError(error, '/api/products', 'GET');
 * }
 */
export const logApiError = (
  error: any, 
  endpoint: string, 
  method: string = 'GET'
) => {
  setCrashlyticsAttribute('api_endpoint', endpoint);
  setCrashlyticsAttribute('api_method', method);
  logError(error, `API Error: ${method} ${endpoint}`);
};

/**
 * Set user properties for better crash tracking
 * 
 * @example
 * setUserProperties({
 *   userId: '123',
 *   email: 'user@example.com',
 *   userType: 'premium'
 * });
 */
export const setUserProperties = (properties: {
  userId?: string;
  email?: string;
  [key: string]: string | undefined;
}) => {
  if (properties.userId) {
    setCrashlyticsUserId(properties.userId);
  }
  
  Object.entries(properties).forEach(([key, value]) => {
    if (value && key !== 'userId') {
      setCrashlyticsAttribute(key, value);
    }
  });
};

/**
 * Clear user properties (call on logout)
 */
export const clearUserProperties = () => {
  setCrashlyticsUserId('anonymous');
  setCrashlyticsAttribute('user_email', 'none');
  setCrashlyticsAttribute('current_screen', 'none');
};
