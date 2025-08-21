#!/usr/bin/env node

import { Command } from 'commander';
import { TestRunner } from './core/TestRunner';
import { TestConfig } from './types';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as YAML from 'yaml';

const program = new Command();

program
  .name('shopaudit')
  .description('Browser test automation tool for validating ecommerce websites')
  .version('1.0.0');

program
  .command('test')
  .description('Run ecommerce website tests')
  .option('-u, --url <url>', 'Base URL of the ecommerce website')
  .option('-p, --products <urls>', 'Comma-separated list of product page URLs')
  .option('-c, --config <file>', 'Configuration file (JSON or YAML)')
  .option('-o, --output <dir>', 'Output directory for reports', './reports')
  .option('-t, --timeout <ms>', 'Page load timeout in milliseconds', '30000')
  .option('-r, --retries <count>', 'Number of retry attempts', '3')
  .option('--headless', 'Run browser in headless mode', true)
  .option('--no-headless', 'Run browser with GUI')
  .option('--verbose', 'Enable verbose output')
  .option('--no-report', 'Skip report generation')
  .action(async (options) => {
    try {
      let config: TestConfig;

      if (options.config) {
        config = await loadConfigFile(options.config);
      } else {
        config = createConfigFromOptions(options);
      }

      if (!config.baseUrl || config.productUrls.length === 0) {
        console.error(chalk.red('Error: Base URL and at least one product URL are required'));
        console.error(chalk.yellow('Use --url and --products options or provide a config file'));
        process.exit(1);
      }

      console.log(chalk.blue('🛍️  ShopAudit - Ecommerce Website Testing Tool'));
      console.log(chalk.gray('==============================================='));
      console.log(chalk.gray(`Base URL: ${config.baseUrl}`));
      console.log(chalk.gray(`Product URLs: ${config.productUrls.length}`));
      console.log(chalk.gray(`Timeout: ${config.timeout}ms`));
      console.log(chalk.gray(`Retry Attempts: ${config.retryAttempts}`));
      console.log(chalk.gray(`Headless: ${config.headless}`));
      console.log('');

      const runner = new TestRunner({
        config,
        outputDir: options.output,
        generateReport: options.report !== false,
        verbose: options.verbose
      });

      await runner.initialize();
      const results = await runner.runTests();
      await runner.cleanup();

      // Exit with appropriate code
      const successRate = results.passedTests / results.totalTests;
      if (successRate >= 0.8) { // 80% success rate threshold
        console.log(chalk.green('\n✅ Tests completed successfully!'));
        process.exit(0);
      } else {
        console.log(chalk.red('\n❌ Tests completed with issues!'));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create a sample configuration file')
  .option('-o, --output <file>', 'Output file name', 'shopaudit.config.yaml')
  .action(async (options) => {
    try {
      const sampleConfig: TestConfig = {
        baseUrl: 'https://www.bollandbranch.com',
        productUrls: [
          'https://www.bollandbranch.com/products/signature-hemmed-sheet-set',
          'https://www.bollandbranch.com/products/signature-hemmed-duvet-set',
          'https://www.bollandbranch.com/products/waffle-bed-blanket'
        ],
        timeout: 30000,
        retryAttempts: 3,
        viewport: {
          width: 1920,
          height: 1080
        },
        headless: true,
        customHeaders: {
          'User-Agent': 'ShopAudit/1.0.0'
        }
      };

      const configContent = YAML.stringify(sampleConfig, { indent: 2 });
      await fs.writeFile(options.output, configContent);
      
      console.log(chalk.green(`✓ Sample configuration created: ${options.output}`));
      console.log(chalk.yellow('Edit the file with your actual website URLs and run:'));
      console.log(chalk.cyan(`  shopaudit test -c ${options.output}`));
      
    } catch (error) {
      console.error(chalk.red('Error creating config file:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

async function loadConfigFile(filePath: string): Promise<TestConfig> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.json') {
      return JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      return YAML.parse(content);
    } else {
      throw new Error('Unsupported config file format. Use .json, .yaml, or .yml');
    }
  } catch (error) {
    throw new Error(`Failed to load config file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createConfigFromOptions(options: any): TestConfig {
  return {
    baseUrl: options.url || '',
    productUrls: options.products ? options.products.split(',').map((url: string) => url.trim()) : [],
    timeout: parseInt(options.timeout, 10),
    retryAttempts: parseInt(options.retries, 10),
    viewport: {
      width: 1920,
      height: 1080
    },
    headless: options.headless
  };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise);
  console.error(chalk.red('Reason:'), reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

program.parse(); 