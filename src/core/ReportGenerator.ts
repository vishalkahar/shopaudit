import { TestReport } from '../types';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';

export class ReportGenerator {
  async generateReport(results: TestReport, outputDir: string): Promise<void> {
    await fs.ensureDir(outputDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFilename = `test-report-${timestamp}`;
    
    // Generate JSON report
    await this.generateJsonReport(results, outputDir, reportFilename);
    
    // Generate HTML report
    await this.generateHtmlReport(results, outputDir, reportFilename);
    
    // Generate console report
    this.generateConsoleReport(results);
  }

  private async generateJsonReport(results: TestReport, outputDir: string, filename: string): Promise<void> {
    const jsonPath = path.join(outputDir, `${filename}.json`);
    await fs.writeJson(jsonPath, results, { spaces: 2 });
    console.log(chalk.green(`✓ JSON report saved to: ${jsonPath}`));
  }

  private async generateHtmlReport(results: TestReport, outputDir: string, filename: string): Promise<void> {
    const htmlPath = path.join(outputDir, `${filename}.html`);
    const htmlContent = this.generateHtmlContent(results);
    await fs.writeFile(htmlPath, htmlContent);
    console.log(chalk.green(`✓ HTML report saved to: ${htmlPath}`));
  }

  private generateConsoleReport(results: TestReport): void {
    console.log(chalk.blue('\n=== SHOPAUDIT TEST REPORT ==='));
    console.log(chalk.gray(`Generated: ${new Date(results.timestamp).toLocaleString()}`));
    console.log(chalk.gray(`Base URL: ${results.baseUrl}`));
    console.log(chalk.gray(`Total Duration: ${(results.totalDuration / 1000).toFixed(2)}s`));
    
    // Summary
    console.log(chalk.yellow('\n📊 SUMMARY:'));
    console.log(`  Total Tests: ${results.totalTests}`);
    console.log(`  Passed: ${chalk.green(results.passedTests)}`);
    console.log(`  Failed: ${chalk.red(results.failedTests)}`);
    console.log(`  Success Rate: ${chalk.cyan(((results.passedTests / results.totalTests) * 100).toFixed(1))}%`);
    
    // Issues
    if (results.summary.criticalIssues > 0 || results.summary.warnings > 0) {
      console.log(chalk.yellow('\n⚠️  ISSUES:'));
      console.log(`  Critical Issues: ${chalk.red(results.summary.criticalIssues)}`);
      console.log(`  Warnings: ${chalk.yellow(results.summary.warnings)}`);
    }

    // Detailed results
    this.generateDetailedConsoleReport(results);
  }

  private generateDetailedConsoleReport(results: TestReport): void {
    // Product Page Results
    if (results.productPageResults.length > 0) {
      console.log(chalk.blue('\n🛍️  PRODUCT PAGE TESTS:'));
      const productTable = new Table({
        head: ['URL', 'Status', 'Load Time', 'Missing Elements'],
        colWidths: [40, 10, 12, 30]
      });

      results.productPageResults.forEach(result => {
        const status = result.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
        const loadTime = `${result.loadTime}ms`;
        const missingElements = result.missingElements.length > 0 
          ? result.missingElements.join(', ') 
          : 'None';
        
        productTable.push([
          this.truncateUrl(result.url),
          status,
          loadTime,
          missingElements
        ]);
      });

      console.log(productTable.toString());
    }

    // Image Loading Results
    if (results.imageResults.length > 0) {
      console.log(chalk.blue('\n🖼️  IMAGE LOADING TESTS:'));
      const imageTable = new Table({
        head: ['URL', 'Status', 'Total', 'Loaded', 'Failed', 'Broken'],
        colWidths: [40, 10, 8, 8, 8, 8]
      });

      results.imageResults.forEach(result => {
        const status = result.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
        imageTable.push([
          this.truncateUrl(result.url),
          status,
          result.images.total,
          chalk.green(result.images.loaded),
          chalk.yellow(result.images.failed),
          chalk.red(result.images.broken)
        ]);
      });

      console.log(imageTable.toString());
    }

    // Error Detection Results
    if (results.errorResults.length > 0) {
      console.log(chalk.blue('\n🚨 ERROR DETECTION TESTS:'));
      const errorTable = new Table({
        head: ['URL', 'Status', 'Console Errors', 'Network Errors', 'Resource Errors'],
        colWidths: [40, 10, 15, 15, 15]
      });

      results.errorResults.forEach(result => {
        const status = result.success ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
        errorTable.push([
          this.truncateUrl(result.url),
          status,
          result.consoleErrors.length,
          result.networkErrors.length,
          result.resourceErrors.length
        ]);
      });

      console.log(errorTable.toString());
    }

    // Recommendations
    if (results.summary.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 RECOMMENDATIONS:'));
      results.summary.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  private generateHtmlContent(results: TestReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopAudit Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .summary {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .section {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .section h2 {
            color: #333;
            margin-top: 0;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .table th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .status-pass {
            color: #28a745;
            font-weight: bold;
        }
        .status-fail {
            color: #dc3545;
            font-weight: bold;
        }
        .recommendations {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .recommendations h3 {
            margin-top: 0;
            color: #856404;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ ShopAudit Test Report</h1>
            <p>Ecommerce Website Validation Results</p>
        </div>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${results.totalTests}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #28a745;">${results.passedTests}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #dc3545;">${results.failedTests}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #667eea;">${((results.passedTests / results.totalTests) * 100).toFixed(1)}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
            </div>
            <p><strong>Base URL:</strong> ${results.baseUrl}</p>
            <p><strong>Generated:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${(results.totalDuration / 1000).toFixed(2)} seconds</p>
        </div>

        <div class="section">
            <h2>🛍️ Product Page Tests</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>Status</th>
                        <th>Load Time</th>
                        <th>Missing Elements</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.productPageResults.map(result => `
                        <tr>
                            <td>${this.escapeHtml(result.url)}</td>
                            <td class="${result.success ? 'status-pass' : 'status-fail'}">
                                ${result.success ? '✓ PASS' : '✗ FAIL'}
                            </td>
                            <td>${result.loadTime}ms</td>
                            <td>${result.missingElements.length > 0 ? result.missingElements.join(', ') : 'None'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🖼️ Image Loading Tests</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>Status</th>
                        <th>Total Images</th>
                        <th>Loaded</th>
                        <th>Failed</th>
                        <th>Broken</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.imageResults.map(result => `
                        <tr>
                            <td>${this.escapeHtml(result.url)}</td>
                            <td class="${result.success ? 'status-pass' : 'status-fail'}">
                                ${result.success ? '✓ PASS' : '✗ FAIL'}
                            </td>
                            <td>${result.images.total}</td>
                            <td style="color: #28a745;">${result.images.loaded}</td>
                            <td style="color: #ffc107;">${result.images.failed}</td>
                            <td style="color: #dc3545;">${result.images.broken}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🚨 Error Detection Tests</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>Status</th>
                        <th>Console Errors</th>
                        <th>Network Errors</th>
                        <th>Resource Errors</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.errorResults.map(result => `
                        <tr>
                            <td>${this.escapeHtml(result.url)}</td>
                            <td class="${result.success ? 'status-pass' : 'status-fail'}">
                                ${result.success ? '✓ PASS' : '✗ FAIL'}
                            </td>
                            <td>${result.consoleErrors.length}</td>
                            <td>${result.networkErrors.length}</td>
                            <td>${result.resourceErrors.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${results.summary.recommendations.length > 0 ? `
        <div class="section">
            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${results.summary.recommendations.map(rec => `<li>${this.escapeHtml(rec)}</li>`).join('')}
                </ul>
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  private truncateUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 37) + '...';
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
} 