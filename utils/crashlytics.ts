import { Platform } from 'react-native';

let crashlytics: any = null;
let isCrashlyticsAvailable = false;

try {
  crashlytics = require('@react-native-firebase/crashlytics').default;
  isCrashlyticsAvailable = true;
} catch (e) {
  console.warn('[Crashlytics] Native module not available - running in fallback mode');
  isCrashlyticsAvailable = false;
}

export class CrashlyticsLogger {
  private static instance: CrashlyticsLogger;
  private isEnabled: boolean = false;

  private constructor() {
    this.initializeCrashlytics();
  }

  static getInstance(): CrashlyticsLogger {
    if (!CrashlyticsLogger.instance) {
      CrashlyticsLogger.instance = new CrashlyticsLogger();
    }
    return CrashlyticsLogger.instance;
  }

  private async initializeCrashlytics() {
    if (!isCrashlyticsAvailable) {
      console.log('[Crashlytics] Running in fallback mode (Expo Go or missing native module)');
      this.isEnabled = false;
      return;
    }

    try {
      if (__DEV__) {
        await crashlytics().setCrashlyticsCollectionEnabled(true);
      }

      await crashlytics().setAttributes({
        platform: Platform.OS,
        version: String(Platform.Version),
        isHermes: String(typeof HermesInternal === 'object' && HermesInternal !== null),
      });

      this.isEnabled = true;
      console.log('[Crashlytics] Initialized successfully');
    } catch (error) {
      console.error('[Crashlytics] Initialization failed:', error);
      this.isEnabled = false;
    }
  }

  async logError(error: Error, context?: string) {
    const logMessage = `[Crashlytics] Error${context ? ` in ${context}` : ''}: ${error.message}`;
    console.error(logMessage, error);

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      if (context) {
        await crashlytics().log(`Error in ${context}: ${error.message}`);
      }
      
      await crashlytics().recordError(error);
    } catch (e) {
      console.error('[Crashlytics] Failed to log error:', e);
    }
  }

  async logNativeError(errorMessage: string, stackTrace?: string) {
    console.error('[Crashlytics] Native error:', errorMessage);
    if (stackTrace) {
      console.error('[Crashlytics] Stack trace:', stackTrace);
    }

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      await crashlytics().log(`[NATIVE ERROR] ${errorMessage}`);
      
      if (stackTrace) {
        await crashlytics().log(`Stack trace: ${stackTrace}`);
      }

      await crashlytics().setAttribute('last_native_error', errorMessage);
      await crashlytics().setAttribute('last_native_error_time', new Date().toISOString());
    } catch (e) {
      console.error('[Crashlytics] Failed to log native error:', e);
    }
  }

  async setUserContext(userId: string, attributes?: Record<string, string>) {
    console.log('[Crashlytics] User context:', userId, attributes);

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      await crashlytics().setUserId(userId);
      
      if (attributes) {
        await crashlytics().setAttributes(attributes);
      }
    } catch (e) {
      console.error('[Crashlytics] Failed to set user context:', e);
    }
  }

  async logMediaOperation(operation: string, details: Record<string, any>) {
    console.log(`[Crashlytics] Media operation: ${operation}`, details);

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      const logMessage = `[MEDIA] ${operation}: ${JSON.stringify(details)}`;
      await crashlytics().log(logMessage);
      
      await crashlytics().setAttribute('last_media_operation', operation);
      await crashlytics().setAttribute('last_media_operation_time', new Date().toISOString());
    } catch (e) {
      console.error('[Crashlytics] Failed to log media operation:', e);
    }
  }

  async logMemoryWarning(availableMemory?: number) {
    const message = availableMemory 
      ? `[MEMORY WARNING] Available: ${availableMemory}MB`
      : '[MEMORY WARNING] Low memory detected';
    console.warn('[Crashlytics]', message);

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      await crashlytics().log(message);
      await crashlytics().setAttribute('memory_warning_time', new Date().toISOString());
    } catch (e) {
      console.error('[Crashlytics] Failed to log memory warning:', e);
    }
  }

  async logCustomEvent(eventName: string, params?: Record<string, any>) {
    console.log(`[Crashlytics] Event: ${eventName}`, params);

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      const logMessage = params 
        ? `[EVENT] ${eventName}: ${JSON.stringify(params)}`
        : `[EVENT] ${eventName}`;
      
      await crashlytics().log(logMessage);
    } catch (e) {
      console.error('[Crashlytics] Failed to log custom event:', e);
    }
  }

  async setBreadcrumb(message: string, category?: string) {
    const breadcrumb = category ? `[${category}] ${message}` : message;
    console.log('[Crashlytics] Breadcrumb:', breadcrumb);

    if (!this.isEnabled || !isCrashlyticsAvailable) return;

    try {
      await crashlytics().log(breadcrumb);
    } catch (e) {
      console.error('[Crashlytics] Failed to set breadcrumb:', e);
    }
  }
}

export const crashLogger = CrashlyticsLogger.getInstance();

export function withCrashProtection<T extends (...args: any[]) => any>(
  fn: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        await crashLogger.logError(error, context);
      }
      throw error;
    }
  }) as T;
}

export function setupGlobalErrorHandlers() {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    originalConsoleError(...args);
    
    const errorMessage = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    if (errorMessage.includes('SIGABRT') || 
        errorMessage.includes('libc.so') ||
        errorMessage.includes('abort()') ||
        errorMessage.includes('native')) {
      crashLogger.logNativeError(errorMessage);
    }
  };

  if (ErrorUtils) {
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      crashLogger.logError(error, isFatal ? 'FATAL' : 'NON_FATAL');
      
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  console.log('[Crashlytics] Global error handlers configured');
}
