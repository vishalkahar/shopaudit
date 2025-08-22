# ShopAudit - Ecommerce Website Testing Tool

A comprehensive browser automation tool for validating e-commerce websites (Shopify/BigCommerce) with automated testing of product pages, image loading, and error detection for production readiness.

## 🚀 Quick Start

### Option 1: Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests with CLI
npm run cli test -c configs/bollandbranch.yaml

# Or start the web server
npm start
```

### Option 2: Deploy to Render.com (Recommended)
For cloud deployment with web interface, see [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for complete step-by-step instructions.

**Quick Render.com Setup:**
1. Push code to GitHub
2. Connect repository to Render.com
3. Deploy as Web Service
4. Access via HTTPS URL

## 📋 Features

- **Product Page Testing**: Validates critical elements (title, price, add-to-cart button), page load time, description, variants, availability, and meta information
- **Image Loading Validation**: Checks if product images load successfully, including primary, gallery, category, and brand images with alt-text validation
- **Error Detection**: Captures JavaScript console errors, network failures (4xx, 5xx), resource loading failures, CORS errors, and security issues
- **Multiple Output Formats**: Console, JSON, and HTML reports with detailed breakdowns
- **Web Service**: HTTP API for running tests remotely
- **Cloud Ready**: Deploy to Render.com, Google Cloud Run, or any container platform

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd shopaudit

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Build the project
npm run build
```

## 📖 Usage

### CLI Mode
```bash
# Run tests with configuration file
npm run cli test -c configs/bollandbranch.yaml

# Run tests with custom configuration
npm run cli test -c configs/redbullshop.yaml

# Initialize new configuration
npm run cli init -o my-config.yaml
```

### Web Service Mode
```bash
# Start the web server
npm start

# Access endpoints:
# - Health check: http://localhost:3000/health
# - Boll & Branch test: http://localhost:3000/test/boll-branch
# - Red Bull test: http://localhost:3000/test/redbull
# - Custom test: POST http://localhost:3000/test
```

## ⚙️ Configuration

### Configuration Files
Configuration files are stored in the `configs/` directory:

- `configs/bollandbranch.yaml` - Boll & Branch website configuration
- `configs/redbullshop.yaml` - Red Bull Shop website configuration  
- `configs/sample.yaml` - Template for creating new configurations

### Configuration Structure
```yaml
baseUrl: "https://www.bollandbranch.com"
productUrls:
  - "https://www.bollandbranch.com/products/organic-cotton-sheet-set"
  - "https://www.bollandbranch.com/products/organic-cotton-duvet-cover"
timeout: 30000
retryAttempts: 3
viewport:
  width: 1920
  height: 1080
headless: true
customHeaders:
  Accept-Language: "en-US,en;q=0.9"
cookies:
  - name: "preferences"
    value: "language=en"
    domain: ".bollandbranch.com"
```

## 📊 Reports

### Report Types
- **Console Output**: Real-time progress and results
- **JSON Report**: Structured data for programmatic access
- **HTML Report**: Visual report with detailed breakdowns

### Report Location
Reports are generated in the `reports/` directory with timestamps:
- `test-report-YYYY-MM-DD-HH-MM-SS.json`
- `test-report-YYYY-MM-DD-HH-MM-SS.html`

### Report Contents
- **Test Summary**: Total tests, passed/failed counts, success rate
- **Product Page Results**: Element validation, load times, errors
- **Image Loading Results**: Image status, alt-text, dimensions, broken images
- **Error Detection**: Console errors, network failures, resource issues
- **Recommendations**: Actionable improvements for the website

## 🌐 Cloud Deployment

### Render.com (Recommended)
See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for complete deployment guide.

**Benefits:**
- Free tier available
- Automatic deployments
- HTTPS endpoints
- Health monitoring
- Easy scaling

### Other Platforms
- **Google Cloud Run**: Use the provided Dockerfile
- **AWS Lambda**: Convert to serverless function
- **Azure Functions**: Deploy as function app
- **Heroku**: Deploy as container

## 🔧 Development

### Project Structure
```
shopaudit/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── http-server.ts        # Web service
│   ├── types/                # TypeScript interfaces
│   └── core/                 # Core testing logic
│       ├── TestRunner.ts     # Main orchestrator
│       ├── ProductPageTester.ts
│       ├── ImageTester.ts
│       ├── ErrorDetector.ts
│       └── ReportGenerator.ts
├── configs/                  # Test configurations
├── reports/                  # Generated reports
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts
```bash
npm run build      # Build TypeScript to JavaScript
npm start          # Start web server
npm run cli        # Run CLI tool
npm run dev        # Development mode with ts-node
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Adding New Test Sites
1. Create new configuration file in `configs/`
2. Add product URLs and site-specific settings
3. Test locally: `npm run cli test -c configs/your-site.yaml`
4. Deploy to cloud for remote access

## 🧪 Testing

### Test Coverage
- **Product Page Elements**: Title, price, add-to-cart, description, variants
- **Image Loading**: Primary images, gallery, thumbnails, alt-text
- **Error Detection**: Console errors, network failures, resource issues
- **Performance**: Page load times, resource loading
- **Accessibility**: Alt-text presence, semantic structure

### Supported Platforms
- **Shopify**: All themes and customizations
- **BigCommerce**: Standard and custom themes
- **Other E-commerce**: Any website with product pages

## 📈 Monitoring and Observability

### Logging
- Structured console logs for cloud platforms
- Error tracking and stack traces
- Performance metrics and timing
- Test execution progress

### Health Checks
- Service health endpoint: `/health`
- Automatic restart on failure
- Uptime monitoring
- Performance alerts

### Metrics
- Test execution time
- Success/failure rates
- Error frequency and types
- Resource usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: This README and RENDER_DEPLOY.md
- **Issues**: Report bugs in GitHub Issues
- **Examples**: Check `configs/` directory for configuration examples

---

**ShopAudit** - Making e-commerce testing simple and automated! 🛍️✨ 