# ShopAudit Configuration Files - Final Structure

## ✅ **Clean and Organized Configuration Files**

After cleaning up redundant files, here's the final, organized structure:

### 📁 **Configuration Directory: `configs/`**

```
configs/
├── bollandbranch.yaml    # Boll & Branch website testing
├── redbullshop.yaml      # Red Bull Shop website testing  
└── sample.yaml           # Template for new users
```

### 🛍️ **Boll & Branch Configuration** (`configs/bollandbranch.yaml`)
- **Website**: https://www.bollandbranch.com
- **Type**: Premium bedding and home goods
- **Products**: 4 product URLs (sheet sets, duvet sets, blankets)
- **Language**: English (en-US)
- **Features**: Complete HTTP headers, proper cookies

### 🏎️ **Red Bull Shop Configuration** (`configs/redbullshop.yaml`)
- **Website**: https://www.redbullshop.com
- **Type**: German sports merchandise and team apparel
- **Products**: 5 product URLs (sweaters, t-shirts, hoodies, polos)
- **Language**: German (de-DE) with English fallback
- **Features**: Complete HTTP headers, proper cookies

### 📋 **Sample Configuration** (`configs/sample.yaml`)
- **Purpose**: Template for new users
- **Format**: Demonstrates proper YAML structure
- **Comments**: Includes helpful documentation

## 🚀 **Usage Examples**

### **Quick Testing**
```bash
# Test Boll & Branch
node dist/index.js test --config configs/bollandbranch.yaml

# Test Red Bull Shop
node dist/index.js test --config configs/redbullshop.yaml
```

### **Multi-Site Testing**
```bash
# Test both sites sequentially
node dist/index.js test --config configs/bollandbranch.yaml && \
node dist/index.js test --config configs/redbullshop.yaml
```

### **Custom Configuration**
```bash
# Generate new config
node dist/index.js init --output my-store-config.yaml

# Edit with your URLs, then test
node dist/index.js test --config my-store-config.yaml
```

## ✅ **Configuration Features**

### **Standard Settings**
- **Timeout**: 30 seconds (configurable)
- **Retry Attempts**: 3 (configurable)
- **Viewport**: 1920x1080 (desktop)
- **Headless Mode**: Enabled by default
- **Browser**: Chromium (Playwright)

### **HTTP Headers**
- **User-Agent**: ShopAudit/1.0.0
- **Accept-Language**: Site-appropriate (en-US, de-DE)
- **Accept**: Modern web standards
- **Accept-Encoding**: gzip, deflate, br
- **Connection**: keep-alive
- **Upgrade-Insecure-Requests**: 1

### **Cookie Support**
- **Session Management**: Configurable session cookies
- **Domain-Specific**: Proper domain settings
- **Path Configuration**: Root path (/)

## 🎯 **Perfect Configuration Status**

### ✅ **Boll & Branch**
- **URLs**: Real product URLs from website
- **Headers**: English language optimized
- **Cookies**: Proper domain configuration
- **Products**: 4 bestseller items

### ✅ **Red Bull Shop**
- **URLs**: Real product URLs from website
- **Headers**: German language optimized
- **Cookies**: Proper domain configuration
- **Products**: 5 new arrival items

### ✅ **Sample Template**
- **Format**: Clean, documented structure
- **Comments**: Helpful guidance for users
- **Generic**: Works for any ecommerce site

## 📊 **Test Coverage**

### **Product Page Testing**
- Critical elements (title, price, description, add-to-cart)
- Page load performance
- Element presence and functionality
- Meta information validation

### **Image Loading Validation**
- All product and page images
- Accessibility compliance (alt text)
- Broken image detection
- Performance metrics

### **Error Detection**
- JavaScript console errors
- Network failures
- Resource loading issues
- Third-party integration errors

## 🎉 **Ready for Production**

All configuration files are now:
- ✅ **Clean and organized**
- ✅ **Properly documented**
- ✅ **Ready for immediate use**
- ✅ **Optimized for each website**
- ✅ **No redundant files**

The configuration structure is now perfect and ready for testing both Boll & Branch and Red Bull Shop websites! 