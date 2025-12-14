import { useState, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { crashLogger } from '../utils/crashlytics';

interface MediaOperationOptions {
  operationName: string;
  timeout?: number;
  retryCount?: number;
}

export function useMediaSafety() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        crashLogger.setBreadcrumb('App returned to foreground', 'AppState');
      } else if (nextAppState.match(/inactive|background/)) {
        crashLogger.setBreadcrumb('App moved to background', 'AppState');
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const executeMediaOperation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options: MediaOperationOptions
    ): Promise<T | null> => {
      const { operationName, timeout = 30000, retryCount = 2 } = options;

      setIsProcessing(true);

      try {
        await crashLogger.logMediaOperation(operationName, {
          timestamp: new Date().toISOString(),
          appState: AppState.currentState,
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Operation timeout: ${operationName}`)), timeout);
        });

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retryCount; attempt++) {
          try {
            if (attempt > 0) {
              await crashLogger.setBreadcrumb(
                `Retry attempt ${attempt} for ${operationName}`,
                'MediaOperation'
              );
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }

            const result = await Promise.race([operation(), timeoutPromise]);

            await crashLogger.logMediaOperation(`${operationName}_SUCCESS`, {
              attempt: attempt + 1,
              timestamp: new Date().toISOString(),
            });

            return result;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (attempt === retryCount) {
              break;
            }
          }
        }

        if (lastError) {
          await crashLogger.logError(lastError, `MediaOperation: ${operationName}`);
          throw lastError;
        }

        return null;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        await crashLogger.logMediaOperation(`${operationName}_FAILED`, {
          error: errorObj.message,
          stack: errorObj.stack,
          timestamp: new Date().toISOString(),
        });

        throw errorObj;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const safeImagePicker = useCallback(
    async (pickerFn: () => Promise<any>) => {
      return executeMediaOperation(pickerFn, {
        operationName: 'ImagePicker',
        timeout: 60000,
        retryCount: 1,
      });
    },
    [executeMediaOperation]
  );

  const safeImageManipulator = useCallback(
    async (manipulatorFn: () => Promise<any>) => {
      return executeMediaOperation(manipulatorFn, {
        operationName: 'ImageManipulator',
        timeout: 45000,
        retryCount: 2,
      });
    },
    [executeMediaOperation]
  );

  const safeVideoOperation = useCallback(
    async (videoFn: () => Promise<any>) => {
      return executeMediaOperation(videoFn, {
        operationName: 'VideoOperation',
        timeout: 90000,
        retryCount: 1,
      });
    },
    [executeMediaOperation]
  );

  const safeDocumentPicker = useCallback(
    async (pickerFn: () => Promise<any>) => {
      return executeMediaOperation(pickerFn, {
        operationName: 'DocumentPicker',
        timeout: 60000,
        retryCount: 1,
      });
    },
    [executeMediaOperation]
  );

  return {
    isProcessing,
    executeMediaOperation,
    safeImagePicker,
    safeImageManipulator,
    safeVideoOperation,
    safeDocumentPicker,
  };
}

export function useMemoryMonitor() {
  const [memoryWarningCount, setMemoryWarningCount] = useState(0);

  useEffect(() => {
    const handleMemoryWarning = () => {
      setMemoryWarningCount(prev => prev + 1);
      crashLogger.logMemoryWarning();
      crashLogger.setBreadcrumb('Memory warning received', 'Memory');
    };

    if (typeof global.gc === 'function') {
      const interval = setInterval(() => {
        if (memoryWarningCount > 3) {
          try {
            if (global.gc) {
              global.gc();
              crashLogger.setBreadcrumb('Manual garbage collection triggered', 'Memory');
            }
          } catch (e) {
            console.warn('Manual GC failed:', e);
          }
        }
      }, 60000);

      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [memoryWarningCount]);

  return { memoryWarningCount };
}
