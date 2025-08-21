import { BrowserContext, Page } from 'playwright';
import { TestConfig, ProductPageTestResult } from '../types';

export class ProductPageTester {
  private context: BrowserContext;
  private config: TestConfig;

  constructor(context: BrowserContext, config: TestConfig) {
    this.context = context;
    this.config = config;
  }

  async testProductPage(url: string): Promise<ProductPageTestResult> {
    const page = await this.context.newPage();
    const startTime = Date.now();
    const result: ProductPageTestResult = {
      url,
      success: false,
      loadTime: 0,
      elements: {
        title: false,
        price: false,
        description: false,
        addToCartButton: false,
        variants: false,
        availability: false,
        metaInfo: false
      },
      missingElements: [],
      errors: []
    };

    try {
      // Navigate to the product page
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });

      result.loadTime = Date.now() - startTime;

      // Test critical elements
      await this.testProductTitle(page, result);
      await this.testProductPrice(page, result);
      await this.testProductDescription(page, result);
      await this.testAddToCartButton(page, result);
      await this.testProductVariants(page, result);
      await this.testProductAvailability(page, result);
      await this.testMetaInformation(page, result);

      // Determine overall success
      const allElementsPresent = Object.values(result.elements).every(present => present);
      result.success = allElementsPresent && result.errors.length === 0;

      if (!result.success) {
        result.missingElements = Object.entries(result.elements)
          .filter(([_, present]) => !present)
          .map(([element]) => element);
      }

    } catch (error) {
      result.errors.push(`Page load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }

    return result;
  }

  private async testProductTitle(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Common selectors for product titles
      const titleSelectors = [
        'h1[class*="product"]',
        'h1[class*="title"]',
        '.product-title',
        '.product-name',
        '[data-testid="product-title"]',
        'h1',
        '.title'
      ];

      for (const selector of titleSelectors) {
        const titleElement = await page.$(selector);
        if (titleElement) {
          const text = await titleElement.textContent();
          if (text && text.trim().length > 0) {
            result.elements.title = true;
            return;
          }
        }
      }
    } catch (error) {
      result.errors.push(`Title test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testProductPrice(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Common selectors for product prices
      const priceSelectors = [
        '[class*="price"]',
        '[class*="Price"]',
        '.product-price',
        '.price',
        '[data-testid="price"]',
        '[data-price]',
        '.current-price',
        '.regular-price'
      ];

      for (const selector of priceSelectors) {
        const priceElement = await page.$(selector);
        if (priceElement) {
          const text = await priceElement.textContent();
          if (text && this.isValidPrice(text)) {
            result.elements.price = true;
            return;
          }
        }
      }
    } catch (error) {
      result.errors.push(`Price test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testProductDescription(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Common selectors for product descriptions
      const descSelectors = [
        '[class*="description"]',
        '[class*="Description"]',
        '.product-description',
        '.description',
        '[data-testid="description"]',
        '.product-details',
        '.product-info'
      ];

      for (const selector of descSelectors) {
        const descElement = await page.$(selector);
        if (descElement) {
          const text = await descElement.textContent();
          if (text && text.trim().length > 10) { // Minimum description length
            result.elements.description = true;
            return;
          }
        }
      }
    } catch (error) {
      result.errors.push(`Description test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testAddToCartButton(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Common selectors for add to cart buttons
      const buttonSelectors = [
        '[class*="add-to-cart"]',
        '[class*="AddToCart"]',
        '.add-to-cart',
        '.addtocart',
        '[data-testid="add-to-cart"]',
        'button[type="submit"]',
        'input[type="submit"]',
        '[class*="buy"]',
        '[class*="purchase"]'
      ];

      for (const selector of buttonSelectors) {
        const button = await page.$(selector);
        if (button) {
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          if (isVisible && isEnabled) {
            result.elements.addToCartButton = true;
            return;
          }
        }
      }
    } catch (error) {
      result.errors.push(`Add to cart button test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testProductVariants(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Common selectors for product variants
      const variantSelectors = [
        '[class*="variant"]',
        '[class*="option"]',
        '.product-variants',
        '.product-options',
        'select[class*="variant"]',
        'select[class*="option"]',
        '[data-testid="variant"]',
        '[data-testid="option"]'
      ];

      for (const selector of variantSelectors) {
        const variantElements = await page.$$(selector);
        if (variantElements.length > 0) {
          result.elements.variants = true;
          return;
        }
      }

      // If no variants found, that's okay for single-variant products
      result.elements.variants = true;
    } catch (error) {
      result.errors.push(`Variants test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testProductAvailability(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Check for out of stock indicators
      const outOfStockSelectors = [
        '[class*="out-of-stock"]',
        '[class*="unavailable"]',
        '.out-of-stock',
        '.unavailable',
        '[data-testid="out-of-stock"]'
      ];

      let isOutOfStock = false;
      for (const selector of outOfStockSelectors) {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          isOutOfStock = true;
          break;
        }
      }

      // If not out of stock, availability is considered good
      result.elements.availability = !isOutOfStock;
    } catch (error) {
      result.errors.push(`Availability test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testMetaInformation(page: Page, result: ProductPageTestResult): Promise<void> {
    try {
      // Check for essential meta tags
      const title = await page.title();
      const metaDescription = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => null);
      
      if (title && title.trim().length > 0 && metaDescription && metaDescription.trim().length > 0) {
        result.elements.metaInfo = true;
      }
    } catch (error) {
      result.errors.push(`Meta information test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isValidPrice(text: string): boolean {
    // Check if text contains currency symbols and numbers
    const priceRegex = /[\$€£¥₹]?\s*\d+([.,]\d{2})?/;
    return priceRegex.test(text.trim());
  }
} 