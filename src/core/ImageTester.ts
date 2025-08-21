import { BrowserContext, Page } from 'playwright';
import { TestConfig, ImageTestResult, ImageDetail } from '../types';

export class ImageTester {
  private context: BrowserContext;
  private config: TestConfig;

  constructor(context: BrowserContext, config: TestConfig) {
    this.context = context;
    this.config = config;
  }

  async testImageLoading(url: string): Promise<ImageTestResult> {
    const page = await this.context.newPage();
    const result: ImageTestResult = {
      url,
      success: false,
      images: {
        total: 0,
        loaded: 0,
        failed: 0,
        broken: 0
      },
      imageDetails: [],
      errors: []
    };

    try {
      // Set up network monitoring for image requests
      const imageRequests: Array<{ url: string; status: number; error?: string }> = [];
      
      page.on('response', (response) => {
        const resourceType = response.request().resourceType();
        if (resourceType === 'image') {
          imageRequests.push({
            url: response.url(),
            status: response.status(),
            error: response.status() >= 400 ? `HTTP ${response.status()}` : undefined
          });
        }
      });

      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });

      // Wait a bit more for lazy-loaded images
      await page.waitForTimeout(2000);

      // Get all images on the page
      const images = await page.$$eval('img', (imgElements) => {
        return imgElements.map((img) => ({
          src: img.getAttribute('src') || img.getAttribute('data-src') || '',
          alt: img.getAttribute('alt') || '',
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
          complete: img.complete,
          naturalWidth: img.naturalWidth || 0,
          naturalHeight: img.naturalHeight || 0
        }));
      });

      result.images.total = images.length;

      // Analyze each image
      for (const img of images) {
        const imageDetail = await this.analyzeImage(page, img, imageRequests);
        result.imageDetails.push(imageDetail);

        if (imageDetail.status === 'loaded') {
          result.images.loaded++;
        } else if (imageDetail.status === 'failed') {
          result.images.failed++;
        } else if (imageDetail.status === 'broken') {
          result.images.broken++;
        }
      }

      // Check for missing alt text
      const imagesWithoutAlt = result.imageDetails.filter(img => !img.alt || img.alt.trim() === '');
      if (imagesWithoutAlt.length > 0) {
        result.errors.push(`${imagesWithoutAlt.length} images missing alt text`);
      }

      // Determine overall success
      const successRate = result.images.loaded / result.images.total;
      result.success = successRate >= 0.9 && result.images.broken === 0; // 90% success rate and no broken images

    } catch (error) {
      result.errors.push(`Image test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }

    return result;
  }

  private async analyzeImage(
    page: Page, 
    img: { src: string; alt: string; width: number; height: number; complete: boolean; naturalWidth: number; naturalHeight: number },
    imageRequests: Array<{ url: string; status: number; error?: string }>
  ): Promise<ImageDetail> {
    const imageDetail: ImageDetail = {
      src: img.src,
      alt: img.alt,
      width: img.width,
      height: img.height,
      status: 'failed'
    };

    try {
      // Check if image has a valid source
      if (!img.src || img.src.trim() === '') {
        imageDetail.status = 'broken';
        imageDetail.error = 'No source URL';
        return imageDetail;
      }

      // Check if image is complete (loaded)
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        imageDetail.status = 'loaded';
        imageDetail.width = img.naturalWidth;
        imageDetail.height = img.naturalHeight;
        return imageDetail;
      }

      // Check network requests for this image
      const request = imageRequests.find(req => req.url === img.src);
      if (request) {
        if (request.status >= 200 && request.status < 300) {
          imageDetail.status = 'loaded';
        } else if (request.status === 404) {
          imageDetail.status = 'broken';
          imageDetail.error = 'Image not found (404)';
        } else {
          imageDetail.status = 'failed';
          imageDetail.error = request.error || `HTTP ${request.status}`;
        }
      } else {
        // Try to check if image loads by making a request
        try {
          const response = await page.evaluate(async (src: string) => {
            try {
              const res = await fetch(src, { method: 'HEAD' });
              return { status: res.status, ok: res.ok };
            } catch (error) {
              return { status: 0, ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
          }, img.src);

          if (response.ok) {
            imageDetail.status = 'loaded';
          } else {
            imageDetail.status = 'broken';
            imageDetail.error = `HTTP ${response.status}`;
          }
        } catch (error) {
          imageDetail.status = 'failed';
          imageDetail.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }

    } catch (error) {
      imageDetail.status = 'failed';
      imageDetail.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return imageDetail;
  }
} 