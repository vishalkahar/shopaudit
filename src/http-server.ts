import express from 'express';
import { TestRunner } from './core/TestRunner';
import { TestConfig } from './types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as YAML from 'yaml';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('reports'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ShopAudit Ecommerce Testing Tool'
  });
});

// Root endpoint with instructions
app.get('/', (req, res) => {
  res.json({
    service: 'ShopAudit Ecommerce Testing Tool',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      test: '/test',
      testBollBranch: '/test/boll-branch',
      testRedBull: '/test/redbull',
      reports: '/reports'
    },
    usage: {
      test: 'POST /test with config in body',
      testBollBranch: 'GET /test/boll-branch',
      testRedBull: 'GET /test/redbull'
    }
  });
});

// Test endpoint with custom config
app.post('/test', async (req, res) => {
  try {
    const config: TestConfig = req.body;
    
    if (!config.baseUrl || !config.productUrls || config.productUrls.length === 0) {
      return res.status(400).json({
        error: 'Invalid configuration. Required: baseUrl and productUrls array'
      });
    }

    const runner = new TestRunner({
      config,
      outputDir: './reports',
      generateReport: true,
      verbose: false
    });

    await runner.initialize();
    const results = await runner.runTests();
    await runner.cleanup();

    res.json({
      success: true,
      results: {
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        successRate: ((results.passedTests / results.totalTests) * 100).toFixed(1) + '%',
        duration: (results.totalDuration / 1000).toFixed(2) + 's',
        criticalIssues: results.summary.criticalIssues,
        warnings: results.summary.warnings
      },
      recommendations: results.summary.recommendations,
      reports: {
        json: `/reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        html: `/reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
      }
    });

  } catch (error) {
    console.error('Test execution failed:', error);
    res.status(500).json({
      error: 'Test execution failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Pre-configured test for Boll & Branch
app.get('/test/boll-branch', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../configs/bollandbranch.yaml');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: TestConfig = YAML.parse(configContent);

    const runner = new TestRunner({
      config,
      outputDir: './reports',
      generateReport: true,
      verbose: false
    });

    await runner.initialize();
    const results = await runner.runTests();
    await runner.cleanup();

    res.json({
      success: true,
      website: 'Boll & Branch',
      results: {
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        successRate: ((results.passedTests / results.totalTests) * 100).toFixed(1) + '%',
        duration: (results.totalDuration / 1000).toFixed(2) + 's',
        criticalIssues: results.summary.criticalIssues,
        warnings: results.summary.warnings
      },
      recommendations: results.summary.recommendations,
      reports: {
        json: `/reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        html: `/reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
      }
    });

  } catch (error) {
    console.error('Boll & Branch test failed:', error);
    
    // Check if it's a browser initialization error
    if (error instanceof Error && error.message.includes('Executable doesn\'t exist')) {
      res.status(500).json({
        error: 'Browser initialization failed',
        message: 'Playwright browsers not properly installed. Please check the build logs.',
        details: error.message,
        suggestion: 'Try redeploying the service or contact support.'
      });
    } else {
      res.status(500).json({
        error: 'Boll & Branch test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Pre-configured test for Red Bull Shop
app.get('/test/redbull', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../configs/redbullshop.yaml');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: TestConfig = YAML.parse(configContent);

    const runner = new TestRunner({
      config,
      outputDir: './reports',
      generateReport: true,
      verbose: false
    });

    await runner.initialize();
    const results = await runner.runTests();
    await runner.cleanup();

    res.json({
      success: true,
      website: 'Red Bull Shop',
      results: {
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        successRate: ((results.passedTests / results.totalTests) * 100).toFixed(1) + '%',
        duration: (results.totalDuration / 1000).toFixed(2) + 's',
        criticalIssues: results.summary.criticalIssues,
        warnings: results.summary.warnings
      },
      recommendations: results.summary.recommendations,
      reports: {
        json: `/reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        html: `/reports/test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
      }
    });

  } catch (error) {
    console.error('Red Bull Shop test failed:', error);
    
    // Check if it's a browser initialization error
    if (error instanceof Error && error.message.includes('Executable doesn\'t exist')) {
      res.status(500).json({
        error: 'Browser initialization failed',
        message: 'Playwright browsers not properly installed. Please check the build logs.',
        details: error.message,
        suggestion: 'Try redeploying the service or contact support.'
      });
    } else {
      res.status(500).json({
        error: 'Red Bull Shop test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// List available reports
app.get('/reports', async (req, res) => {
  try {
    const reportsDir = './reports';
    const files = await fs.readdir(reportsDir);
    
    const reports = files
      .filter(file => file.endsWith('.json') || file.endsWith('.html'))
      .map(file => ({
        name: file,
        url: `/reports/${file}`,
        type: file.endsWith('.json') ? 'json' : 'html',
        size: fs.statSync(path.join(reportsDir, file)).size
      }))
      .sort((a, b) => b.size - a.size);

    res.json({
      reports,
      total: reports.length
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to list reports',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ShopAudit HTTP Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🛍️  Test Boll & Branch: http://localhost:${PORT}/test/boll-branch`);
  console.log(`🏎️  Test Red Bull Shop: http://localhost:${PORT}/test/redbull`);
});
