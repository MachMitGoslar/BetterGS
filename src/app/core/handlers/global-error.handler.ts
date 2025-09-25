import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { I18nService } from '../services/i18n.service';

/**
 * GlobalErrorHandler - Application-wide Error Handling
 *
 * A centralized error handler that captures unhandled errors throughout
 * the application and provides consistent user feedback and logging.
 *
 * Key Features:
 * - Centralized error logging and reporting
 * - User-friendly error notifications
 * - Integration with i18n for localized error messages
 * - Firebase and network error categorization
 * - Development vs production error handling
 *
 * Error Categories:
 * - Firebase Authentication errors
 * - Network connectivity errors
 * - Application logic errors
 * - Unknown/unexpected errors
 *
 * Usage:
 * Automatically catches unhandled errors when provided in app config:
 * ```typescript
 * providers: [
 *   { provide: ErrorHandler, useClass: GlobalErrorHandler }
 * ]
 * ```
 *
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);

  /**
   * Handles unhandled errors throughout the application
   * @param error - The unhandled error object
   */
  handleError(error: unknown): void {
    console.error('Global error caught:', error);

    // Extract meaningful error information
    const errorInfo = this.extractErrorInfo(error);

    // Log error for debugging
    this.logError(errorInfo);

    // Show user-friendly notification
    this.showUserNotification(errorInfo);
  }

  /**
   * Extracts structured information from error objects
   * @param error - Raw error object
   * @returns Structured error information
   */
  private extractErrorInfo(error: unknown): ErrorInfo {
    // Handle Firebase Auth errors
    if (this.isFirebaseAuthError(error)) {
      return {
        type: 'firebase-auth',
        code: error.code,
        message: error.message,
        userMessage: this.getFirebaseAuthErrorMessage(error.code),
      };
    }

    // Handle network errors
    if (this.isNetworkError(error)) {
      return {
        type: 'network',
        code: 'network-error',
        message: error instanceof Error ? error.message : 'Network error',
        userMessage: this.i18nService.getTranslation('error.network_error'),
      };
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return {
        type: 'application',
        code: error.name,
        message: error.message,
        userMessage: this.i18nService.getTranslation('error.unexpected_error'),
      };
    }

    // Handle unknown errors
    return {
      type: 'unknown',
      code: 'unknown-error',
      message: String(error),
      userMessage: this.i18nService.getTranslation('error.unexpected_error'),
    };
  }

  /**
   * Type guard for Firebase Authentication errors
   * @param error - Error object to check
   * @returns true if error is a Firebase Auth error
   */
  private isFirebaseAuthError(
    error: unknown
  ): error is { code: string; message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as any).code === 'string' &&
      (error as any).code.startsWith('auth/')
    );
  }

  /**
   * Type guard for network-related errors
   * @param error - Error object to check
   * @returns true if error is network-related
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      const networkKeywords = [
        'network',
        'fetch',
        'timeout',
        'connection',
        'offline',
        'internet',
        'connectivity',
      ];
      const errorText = error.message.toLowerCase();
      return networkKeywords.some((keyword) => errorText.includes(keyword));
    }
    return false;
  }

  /**
   * Gets localized error message for Firebase Auth error codes
   * @param code - Firebase Auth error code
   * @returns Localized error message
   */
  private getFirebaseAuthErrorMessage(code: string): string {
    const errorMap: { [key: string]: string } = {
      'auth/user-not-found': 'error.user_not_found',
      'auth/wrong-password': 'error.wrong_password',
      'auth/invalid-email': 'error.invalid_email',
      'auth/user-disabled': 'error.user_disabled',
      'auth/too-many-requests': 'error.too_many_requests',
      'auth/network-request-failed': 'error.network_error',
      'auth/invalid-credential': 'error.invalid_credentials',
    };

    const translationKey = errorMap[code] || 'error.authentication_error';
    return this.i18nService.getTranslation(translationKey);
  }

  /**
   * Logs error information for debugging and monitoring
   * @param errorInfo - Structured error information
   */
  private logError(errorInfo: ErrorInfo): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: errorInfo.type,
      code: errorInfo.code,
      message: errorInfo.message,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, this could be sent to a logging service
    console.group('🚨 Application Error');
    console.error('Error Type:', errorInfo.type);
    console.error('Error Code:', errorInfo.code);
    console.error('Error Message:', errorInfo.message);
    console.error('Full Log Data:', logData);
    console.groupEnd();
  }

  /**
   * Shows user-friendly error notification
   * @param errorInfo - Structured error information
   */
  private showUserNotification(errorInfo: ErrorInfo): void {
    // Don't show notifications for certain error types in production
    if (this.shouldSuppressNotification(errorInfo)) {
      return;
    }

    this.notificationService.addNotification(errorInfo.userMessage, 'danger');
  }

  /**
   * Determines if error notification should be suppressed
   * @param errorInfo - Structured error information
   * @returns true if notification should be suppressed
   */
  private shouldSuppressNotification(errorInfo: ErrorInfo): boolean {
    // Suppress notifications for certain error types to avoid spam
    const suppressedTypes = ['unknown'];
    const suppressedCodes = ['network-timeout'];

    return (
      suppressedTypes.includes(errorInfo.type) ||
      suppressedCodes.includes(errorInfo.code)
    );
  }
}

/**
 * Interface for structured error information
 */
interface ErrorInfo {
  type: 'firebase-auth' | 'network' | 'application' | 'unknown';
  code: string;
  message: string;
  userMessage: string;
}
