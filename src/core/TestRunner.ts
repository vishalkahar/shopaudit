import { Browser, BrowserContext } from 'playwright';
import { chromium } from 'playwright';
import { TestConfig, TestReport, TestRunnerOptions, ProductPageTestResult, ImageTestResult, ErrorTestResult } from '../types';
import { ProductPageTester } from './ProductPageTester';
import { ImageTester } from './ImageTester';
import { ErrorDetector } from './ErrorDetector';
import { ReportGenerator } from './ReportGenerator';
import chalk from 'chalk';
import ora from 'ora';

export class TestRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: TestConfig;
  private outputDir: string;
  private generateReport: boolean;
  private verbose: boolean;

  constructor(options: TestRunnerOptions) {
    this.config = options.config;
    this.outputDir = options.outputDir || './reports';
    this.generateReport = options.generateReport ?? true;
    this.verbose = options.verbose ?? false;
  }

  async initialize(): Promise<void> {
    const spinner = ora('Initializing browser...').start();
    
    try {
      // Try different browser executable paths for Render.com
      const executablePaths = [
        process.env.PLAYWRIGHT_BROWSERS_PATH ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium_headless_shell-1187/chrome-linux/headless_shell` : undefined,
        '/opt/render/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell',
        '/root/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell',
        '/home/render/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell'
      ].filter((path): path is string => path !== undefined);

      let browser: Browser | null = null;
      let lastError: any = null;

      for (const executablePath of executablePaths) {
        try {
          console.log(`Trying browser path: ${executablePath}`);
          browser = await chromium.launch({
            headless: this.config.headless,
            executablePath,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu'
            ]
          });
          console.log(`Successfully launched browser from: ${executablePath}`);
          break;
        } catch (error) {
          console.log(`Failed to launch browser from ${executablePath}:`, error);
          lastError = error;
        }
      }

      if (!browser) {
        // Fallback to default launch
        console.log('Trying default browser launch...');
        browser = await chromium.launch({
          headless: this.config.headless,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
      }

      this.browser = browser;

      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        extraHTTPHeaders: this.config.customHeaders,
        ignoreHTTPSErrors: true,
        acceptDownloads: false
      });

      // Set cookies if provided
      if (this.config.cookies) {
        await this.context.addCookies(this.config.cookies);
      }

      spinner.succeed('Browser initialized successfully');
    } catch (error) {
      spinner.fail('Failed to initialize browser');
      throw error;
    }
  }

  async runTests(): Promise<TestReport> {
    if (!this.browser || !this.context) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    const spinner = ora('Running ecommerce tests...').start();

    const results: TestReport = {
      timestamp: new Date().toISOString(),
      baseUrl: this.config.baseUrl,
      totalTests: this.config.productUrls.length * 3, // 3 test types per URL
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0,
      productPageResults: [],
      imageResults: [],
      errorResults: [],
      summary: {
        criticalIssues: 0,
        warnings: 0,
        recommendations: []
      }
    };

    try {
      // Initialize testers
      const productPageTester = new ProductPageTester(this.context, this.config);
      const imageTester = new ImageTester(this.context, this.config);
      const errorDetector = new ErrorDetector(this.context, this.config);

      // Run tests for each product URL
      for (let i = 0; i < this.config.productUrls.length; i++) {
        const url = this.config.productUrls[i];
        spinner.text = `Testing product page ${i + 1}/${this.config.productUrls.length}: ${url}`;

        // Product page testing
        const productResult = await this.runWithRetry(() => 
          productPageTester.testProductPage(url)
        );
        results.productPageResults.push(productResult);

        // Image loading testing
        const imageResult = await this.runWithRetry(() => 
          imageTester.testImageLoading(url)
        );
        results.imageResults.push(imageResult);

        // Error detection
        const errorResult = await this.runWithRetry(() => 
          errorDetector.detectErrors(url)
        );
        results.errorResults.push(errorResult);

        // Update counters
        if (productResult.success) results.passedTests++;
        else results.failedTests++;
        
        if (imageResult.success) results.passedTests++;
        else results.failedTests++;
        
        if (errorResult.success) results.passedTests++;
        else results.failedTests++;

        if (this.verbose) {
          this.logTestResult(url, productResult, imageResult, errorResult);
        }
      }

      results.totalDuration = Date.now() - startTime;
      results.summary = this.generateSummary(results);

      spinner.succeed(`Tests completed in ${(results.totalDuration / 1000).toFixed(2)}s`);

      // Generate report if requested
      if (this.generateReport) {
        const reportGenerator = new ReportGenerator();
        await reportGenerator.generateReport(results, this.outputDir);
      }

      return results;
    } catch (error) {
      spinner.fail('Test execution failed');
      throw error;
    }
  }

  private async runWithRetry<T>(testFn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await testFn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  private logTestResult(
    url: string,
    productResult: ProductPageTestResult,
    imageResult: ImageTestResult,
    errorResult: ErrorTestResult
  ): void {
    console.log(chalk.blue(`\n=== Test Results for ${url} ===`));
    
    // Product page results
    console.log(chalk.yellow('Product Page:'), 
      productResult.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL'));
    if (!productResult.success && productResult.missingElements.length > 0) {
      console.log(chalk.red('  Missing elements:'), productResult.missingElements.join(', '));
    }

    // Image results
    console.log(chalk.yellow('Image Loading:'), 
      imageResult.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL'));
    if (imageResult.images.failed > 0) {
      console.log(chalk.red(`  Failed images: ${imageResult.images.failed}/${imageResult.images.total}`));
    }

    // Error results
    console.log(chalk.yellow('Error Detection:'), 
      errorResult.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL'));
    if (errorResult.totalErrors > 0) {
      console.log(chalk.red(`  Total errors: ${errorResult.totalErrors}`));
    }
  }

  private generateSummary(results: TestReport): TestReport['summary'] {
    let criticalIssues = 0;
    let warnings = 0;
    const recommendations: string[] = [];

    // Analyze product page results
    results.productPageResults.forEach(result => {
      if (!result.success) {
        criticalIssues++;
        if (result.missingElements.includes('addToCartButton')) {
          recommendations.push('Add-to-cart button is missing or non-functional');
        }
        if (result.missingElements.includes('price')) {
          recommendations.push('Product price is not displayed correctly');
        }
      }
    });

    // Analyze image results
    results.imageResults.forEach(result => {
      if (result.images.failed > 0) {
        warnings++;
        recommendations.push(`Fix ${result.images.failed} broken images`);
      }
    });

    // Analyze error results
    results.errorResults.forEach(result => {
      if (result.consoleErrors.length > 0) {
        warnings++;
        recommendations.push('Fix JavaScript console errors');
      }
      if (result.networkErrors.length > 0) {
        criticalIssues++;
        recommendations.push('Resolve network request failures');
      }
    });

    return {
      criticalIssues,
      warnings,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  async cleanup(): Promise<void> {
    const spinner = ora('Cleaning up...').start();
    
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      spinner.succeed('Cleanup completed');
    } catch (error) {
      spinner.fail('Cleanup failed');
      throw error;
    }
  }
} 