import { BrowserContext } from 'playwright';
import { TestConfig, ErrorTestResult, ConsoleError, NetworkError, ResourceError } from '../types';

export class ErrorDetector {
  private context: BrowserContext;
  private config: TestConfig;

  constructor(context: BrowserContext, config: TestConfig) {
    this.context = context;
    this.config = config;
  }

  async detectErrors(url: string): Promise<ErrorTestResult> {
    const page = await this.context.newPage();
    const result: ErrorTestResult = {
      url,
      success: false,
      consoleErrors: [],
      networkErrors: [],
      resourceErrors: [],
      totalErrors: 0
    };

    try {
      // Set up console error monitoring
      page.on('console', (msg) => {
        const level = msg.type() as 'error' | 'warning' | 'info';
        if (level === 'error' || level === 'warning') {
          const consoleError: ConsoleError = {
            level,
            message: msg.text(),
            source: msg.location().url || 'unknown',
            lineNumber: msg.location().lineNumber,
            columnNumber: msg.location().columnNumber
          };
          result.consoleErrors.push(consoleError);
        }
      });

      // Set up page error monitoring
      page.on('pageerror', (error) => {
        const consoleError: ConsoleError = {
          level: 'error',
          message: error.message,
          source: error.stack?.split('\n')[1]?.trim() || 'unknown',
          stack: error.stack
        };
        result.consoleErrors.push(consoleError);
      });

      // Set up network error monitoring
      page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
          const request = response.request();
          const networkError: NetworkError = {
            url: response.url(),
            status,
            statusText: response.statusText(),
            method: request.method(),
            resourceType: request.resourceType()
          };
          result.networkErrors.push(networkError);
        }
      });

      // Set up request failure monitoring
      page.on('requestfailed', (request) => {
        const resourceError: ResourceError = {
          url: request.url(),
          type: this.getResourceType(request.resourceType()),
          error: request.failure()?.errorText || 'Request failed'
        };
        result.resourceErrors.push(resourceError);
      });

      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });

      // Wait for any delayed errors
      await page.waitForTimeout(3000);

      // Check for additional JavaScript errors
      const additionalErrors = await page.evaluate(() => {
        const errors: Array<{ message: string; source: string }> = [];
        
        // Check for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
          errors.push({
            message: event.reason?.message || 'Unhandled promise rejection',
            source: 'unhandledrejection'
          });
        });

        // Check for global error handler
        const originalOnError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
          errors.push({
            message: typeof message === 'string' ? message : 'Unknown error',
            source: source || 'unknown'
          });
          if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
          }
          return false;
        };

        return errors;
      });

      // Add additional errors to console errors
      additionalErrors.forEach(error => {
        result.consoleErrors.push({
          level: 'error',
          message: error.message,
          source: error.source
        });
      });

      // Calculate total errors
      result.totalErrors = result.consoleErrors.length + result.networkErrors.length + result.resourceErrors.length;
      
      // Determine success (no critical errors)
      const criticalErrors = result.consoleErrors.filter(e => e.level === 'error').length;
      const networkFailures = result.networkErrors.filter(e => e.status >= 500).length;
      result.success = criticalErrors === 0 && networkFailures === 0;

    } catch (error) {
      result.consoleErrors.push({
        level: 'error',
        message: `Page load failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'test-runner'
      });
      result.totalErrors++;
    } finally {
      await page.close();
    }

    return result;
  }

  private getResourceType(playwrightType: string): 'css' | 'js' | 'image' | 'font' | 'other' {
    switch (playwrightType) {
      case 'stylesheet':
        return 'css';
      case 'script':
        return 'js';
      case 'image':
        return 'image';
      case 'font':
        return 'font';
      default:
        return 'other';
    }
  }
} 