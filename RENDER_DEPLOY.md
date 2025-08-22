# ShopAudit Deployment Guide for Render.com

This guide will walk you through deploying ShopAudit as a Web Service on Render.com, making it accessible via HTTP endpoints.

## 🎯 What You'll Get

After deployment, you'll have:
- **Web Service**: Accessible via HTTPS URL
- **API Endpoints**: Run tests via HTTP requests
- **Pre-configured Tests**: Boll & Branch and Red Bull Shop
- **Report Access**: View HTML and JSON reports via web
- **Health Monitoring**: Automatic health checks
- **Auto-deployment**: Updates on every Git push

## 📋 Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository
2. **Render.com Account**: Sign up at https://render.com
3. **Node.js Knowledge**: Basic understanding of web services

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Render.com web service support"
   git push origin main
   ```

2. **Verify Repository Structure**:
   ```
   shopaudit/
   ├── src/
   │   ├── http-server.ts    # Web service
   │   ├── index.ts          # CLI tool
   │   └── core/             # Test logic
   ├── configs/              # Test configurations
   ├── package.json          # Dependencies
   ├── tsconfig.json         # TypeScript config
   └── render.yaml           # Render configuration
   ```

### Step 2: Create Render.com Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Verify your email address

### Step 3: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - In Render dashboard, click "New +"
   - Select "Blueprint" (for render.yaml)
   - Connect your GitHub account
   - Select your `shopaudit` repository
   - Click "Connect"

2. **Deploy**:
   - Render will automatically detect `render.yaml`
   - Click "Apply" to start deployment
   - Wait for build to complete (5-10 minutes)

#### Option B: Manual Setup

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `shopaudit` repository

2. **Configure Service**:
   - **Name**: `shopaudit` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: 
     ```bash
     npm install && npx playwright install chromium && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```

3. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete

### Step 4: Verify Deployment

1. **Check Health**:
   - Your service URL will be: `https://your-app-name.onrender.com`
   - Visit: `https://your-app-name.onrender.com/health`
   - Should return: `{"status":"healthy","service":"ShopAudit Ecommerce Testing Tool"}`

2. **Test Endpoints**:
   - Root: `https://your-app-name.onrender.com/`
   - Boll & Branch Test: `https://your-app-name.onrender.com/test/boll-branch`
   - Red Bull Test: `https://your-app-name.onrender.com/test/redbull`

## 🔧 Using Your Deployed Service

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information and available endpoints |
| `/health` | GET | Health check |
| `/test/boll-branch` | GET | Run Boll & Branch tests |
| `/test/redbull` | GET | Run Red Bull Shop tests |
| `/test` | POST | Run custom tests (send config in body) |
| `/reports` | GET | List available test reports |
| `/reports/filename.json` | GET | Download JSON report |
| `/reports/filename.html` | GET | Download HTML report |

### Running Tests

#### 1. Pre-configured Tests (Easiest)

**Boll & Branch Test**:
```bash
curl https://your-app-name.onrender.com/test/boll-branch
```

**Red Bull Shop Test**:
```bash
curl https://your-app-name.onrender.com/test/redbull
```

#### 2. Custom Tests

Send a POST request with your configuration:

```bash
curl -X POST https://your-app-name.onrender.com/test \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "https://your-store.com",
    "productUrls": [
      "https://your-store.com/products/product1",
      "https://your-store.com/products/product2"
    ],
    "timeout": 30000,
    "retryAttempts": 3,
    "viewport": {"width": 1920, "height": 1080},
    "headless": true
  }'
```

### Viewing Results

1. **JSON Response**: Each test returns a summary
2. **HTML Reports**: Visit `/reports` to see all reports
3. **Direct Report Access**: Use the URLs in the response

## 📊 Monitoring and Logs

### View Logs
1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. View real-time logs

### Health Monitoring
- Render automatically checks `/health` endpoint
- Service restarts if health check fails
- Monitor uptime in dashboard

## 🔄 Auto-Deployment

### Automatic Updates
- Every push to `main` branch triggers deployment
- Render automatically builds and deploys
- No manual intervention needed

### Manual Deployment
- Go to service dashboard
- Click "Manual Deploy"
- Select branch to deploy

## 💰 Pricing and Limits

### Free Tier
- **Builds**: 750 minutes/month
- **Runtime**: 750 hours/month
- **Bandwidth**: 100 GB/month
- **Perfect for**: Testing and development

### Paid Plans
- **Starter**: $7/month
- **Standard**: $25/month
- **Pro**: $50/month

## 🛠️ Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check logs for error messages
   - Verify `package.json` has all dependencies
   - Ensure Playwright browsers install correctly

2. **Service Won't Start**:
   - Check if port 3000 is available
   - Verify `npm start` works locally
   - Check environment variables

3. **Tests Time Out**:
   - Increase timeout in config
   - Check if target websites are accessible
   - Verify product URLs are correct

### Debug Commands

**Local Testing**:
```bash
npm install
npm run build
npm start
# Visit http://localhost:3000/health
```

**Check Logs**:
```bash
# In Render dashboard → Logs tab
# Look for error messages and stack traces
```

## 🔒 Security Considerations

1. **Public Access**: Your service is publicly accessible
2. **Rate Limiting**: Consider adding rate limiting for production
3. **Authentication**: Add authentication for sensitive operations
4. **Environment Variables**: Use Render's environment variables for secrets

## 📈 Scaling

### Performance Optimization
- Tests run sequentially (one at a time)
- Each test takes 1-3 minutes
- Memory usage: ~500MB per test
- CPU usage: Moderate during browser automation

### Scaling Options
1. **Upgrade Plan**: More resources
2. **Multiple Services**: Deploy separate instances
3. **Queue System**: Implement job queuing for multiple tests

## 🎉 Next Steps

### After Deployment
1. **Test All Endpoints**: Verify everything works
2. **Set Up Monitoring**: Monitor service health
3. **Configure Alerts**: Set up notifications for failures
4. **Documentation**: Share service URL with team

### Advanced Features
1. **Custom Configs**: Add more website configurations
2. **Scheduled Tests**: Set up cron jobs
3. **Integration**: Connect to monitoring tools
4. **API Keys**: Add authentication for production use

## 📞 Support

- **Render Support**: https://render.com/docs/help
- **GitHub Issues**: Report bugs in your repository
- **Documentation**: This guide and README.md

---

**Your ShopAudit service is now live and ready to test ecommerce websites!** 🚀
