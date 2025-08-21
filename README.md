# 🛍️ ShopAudit - Ecommerce Website Testing Tool

A comprehensive browser test automation tool designed specifically for validating ecommerce websites built on Shopify and BigCommerce platforms. ShopAudit performs automated testing of product pages, image loading validation, and error detection to ensure production readiness.

## ✨ Features

### 🛍️ Product Page Testing
- **Critical Element Validation**: Tests for product title, price, description, add-to-cart button
- **Page Load Performance**: Measures page load times and responsiveness
- **Element Presence**: Validates essential ecommerce elements are present and functional
- **Meta Information**: Checks page title and meta descriptions for SEO compliance

### 🖼️ Image Loading Validation
- **Comprehensive Image Testing**: Validates all product and page images
- **Accessibility Compliance**: Checks for alt text presence
- **Broken Image Detection**: Identifies 404 errors and failed image loads
- **Performance Metrics**: Tracks image loading success rates

### 🚨 Error Detection
- **JavaScript Console Errors**: Captures and categorizes console errors and warnings
- **Network Failures**: Monitors HTTP response codes and request failures
- **Resource Loading**: Tracks CSS, JS, and other resource loading issues
- **Third-party Integration**: Monitors analytics and payment processor errors

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopaudit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install chromium
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

### Basic Usage

#### Using Command Line Options
```bash
# Test Boll & Branch website
npm start test --url "https://www.bollandbranch.com" --products "https://www.bollandbranch.com/products/signature-hemmed-sheet-set"

# Test Red Bull Shop website
npm start test --url "https://www.redbullshop.com" --products "https://www.redbullshop.com/de/neuheiten/urban-sweater-m-rbb25039-red-bull-bora-hansgrohe"

# Test multiple product pages (Boll & Branch)
npm start test --url "https://www.bollandbranch.com" --products "https://www.bollandbranch.com/products/signature-hemmed-sheet-set,https://www.bollandbranch.com/products/waffle-bed-blanket"

# Test multiple product pages (Red Bull Shop)
npm start test --url "https://www.redbullshop.com" --products "https://www.redbullshop.com/de/neuheiten/urban-sweater-m-rbb25039-red-bull-bora-hansgrohe,https://www.redbullshop.com/de/neuheiten/spain-t-shirt-m-rbb25042-red-bull-bora-hansgrohe"

# Custom timeout and retry settings
npm start test --url "https://www.bollandbranch.com" --products "https://www.bollandbranch.com/products/signature-hemmed-duvet-set" --timeout 45000 --retries 5
```

#### Using Configuration File
1. **Use pre-configured files**
   ```bash
   # Test Boll & Branch website
   node dist/index.js test --config configs/bollandbranch.yaml
   
   # Test Red Bull Shop website
   node dist/index.js test --config configs/redbullshop.yaml
   ```

2. **Create your own configuration**
   ```bash
   # Generate a sample configuration
   node dist/index.js init --output my-config.yaml
   
   # Edit the configuration file with your URLs
   # Then run tests
   node dist/index.js test --config my-config.yaml
   ```

3. **Configuration file example**
   ```yaml
   baseUrl: "https://your-store.example.com"
   productUrls:
     - "https://your-store.example.com/products/product-1"
     - "https://your-store.example.com/products/product-2"
   timeout: 30000
   retryAttempts: 3
   viewport:
     width: 1920
     height: 1080
   headless: true
   customHeaders:
     User-Agent: "ShopAudit/1.0.0"
   ```

## 📊 Test Reports

ShopAudit generates comprehensive reports in multiple formats:

### Console Output
Real-time test progress and results displayed in the terminal with color-coded status indicators.

### JSON Report
Detailed test results in JSON format for programmatic analysis and integration with CI/CD pipelines.

### HTML Report
Beautiful, interactive HTML report with:
- Test summary and statistics
- Detailed results for each test type
- Visual status indicators
- Recommendations for improvements

### Report Location
Reports are saved to the `./reports` directory by default (configurable with `--output` option).

## ⚙️ Configuration Options

### Command Line Options
| Option | Description | Default |
|--------|-------------|---------|
| `-u, --url` | Base URL of the ecommerce website | Required |
| `-p, --products` | Comma-separated list of product page URLs | Required |
| `-c, --config` | Configuration file (JSON or YAML) | - |
| `-o, --output` | Output directory for reports | `./reports` |
| `-t, --timeout` | Page load timeout in milliseconds | `30000` |
| `-r, --retries` | Number of retry attempts | `3` |
| `--headless` | Run browser in headless mode | `true` |
| `--no-headless` | Run browser with GUI | - |
| `--verbose` | Enable verbose output | `false` |
| `--no-report` | Skip report generation | `false` |

### Configuration File Format

#### YAML Example
```yaml
baseUrl: "https://www.bollandbranch.com"
productUrls:
  - "https://www.bollandbranch.com/products/signature-hemmed-sheet-set"
  - "https://www.bollandbranch.com/products/signature-hemmed-duvet-set"
timeout: 30000
retryAttempts: 3
viewport:
  width: 1920
  height: 1080
headless: true
customHeaders:
  User-Agent: "ShopAudit/1.0.0"
cookies:
  - name: "session_id"
    value: "your-session-value"
    domain: ".bollandbranch.com"
```

#### JSON Example
```json
{
  "baseUrl": "https://www.bollandbranch.com",
  "productUrls": [
    "https://www.bollandbranch.com/products/signature-hemmed-sheet-set",
    "https://www.bollandbranch.com/products/signature-hemmed-duvet-set"
  ],
  "timeout": 30000,
  "retryAttempts": 3,
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "headless": true,
  "customHeaders": {
    "User-Agent": "ShopAudit/1.0.0"
  }
}
```

## 🔧 Advanced Usage

### Multi-Site Testing

ShopAudit supports testing multiple ecommerce websites simultaneously. You can use separate configuration files for each site:

```bash
# Test Boll & Branch website
node dist/index.js test --config configs/bollandbranch.yaml

# Test Red Bull Shop website  
node dist/index.js test --config configs/redbullshop.yaml

# Test both sites sequentially
node dist/index.js test --config configs/bollandbranch.yaml && node dist/index.js test --config configs/redbullshop.yaml
```

### CI/CD Integration
```yaml
# GitHub Actions Example
name: Ecommerce Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run build
      - run: npm start test --config test-config.yaml
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: reports/
```

### Docker Integration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npx playwright install chromium
CMD ["npm", "start", "test", "--config", "config.yaml"]
```

### Custom Test Scenarios
```typescript
import { TestRunner } from './src/core/TestRunner';
import { TestConfig } from './src/types';

const config: TestConfig = {
  baseUrl: 'https://www.bollandbranch.com',
  productUrls: ['https://www.bollandbranch.com/products/signature-hemmed-sheet-set'],
  timeout: 30000,
  retryAttempts: 3,
  viewport: { width: 1920, height: 1080 },
  headless: true
};

async function runCustomTests() {
  const runner = new TestRunner({ config });
  await runner.initialize();
  const results = await runner.runTests();
  await runner.cleanup();
  
  console.log(`Tests completed: ${results.passedTests}/${results.totalTests} passed`);
}
```

## 📈 Test Results Interpretation

### Success Criteria
- **Product Page Tests**: All critical elements present and functional
- **Image Loading Tests**: 90%+ success rate with no broken images
- **Error Detection Tests**: No critical JavaScript errors or network failures

### Exit Codes
- `0`: Tests passed (80%+ success rate)
- `1`: Tests failed or encountered issues

### Report Analysis
1. **Review Summary**: Check overall success rate and critical issues
2. **Product Page Issues**: Identify missing elements or functionality problems
3. **Image Problems**: Address broken images and missing alt text
4. **Error Resolution**: Fix JavaScript errors and network failures
5. **Follow Recommendations**: Implement suggested improvements

## 🛠️ Development

### Project Structure
```
shopaudit/
├── src/
│   ├── core/
│   │   ├── TestRunner.ts          # Main test orchestration
│   │   ├── ProductPageTester.ts   # Product page validation
│   │   ├── ImageTester.ts         # Image loading tests
│   │   ├── ErrorDetector.ts       # Error detection
│   │   └── ReportGenerator.ts     # Report generation
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   └── index.ts                   # CLI entry point
├── reports/                       # Generated test reports
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts
```bash
npm run build      # Build TypeScript to JavaScript
npm run start      # Run the built application
npm run dev        # Run with ts-node for development
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Adding Custom Tests
1. Create a new tester class in `src/core/`
2. Implement the test logic following existing patterns
3. Add the tester to the `TestRunner` class
4. Update types and interfaces as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the test reports for detailed error information

## 🔄 Version History

- **v1.0.0**: Initial release with core ecommerce testing functionality
  - Product page validation
  - Image loading tests
  - Error detection
  - Comprehensive reporting

---

**Built with ❤️ for the ecommerce community** 