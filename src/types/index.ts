export interface TestConfig {
  baseUrl: string;
  productUrls: string[];
  timeout: number;
  retryAttempts: number;
  viewport: {
    width: number;
    height: number;
  };
  headless: boolean;
  customHeaders?: Record<string, string>;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
}

export interface ProductPageTestResult {
  url: string;
  success: boolean;
  loadTime: number;
  elements: {
    title: boolean;
    price: boolean;
    description: boolean;
    addToCartButton: boolean;
    variants: boolean;
    availability: boolean;
    metaInfo: boolean;
  };
  missingElements: string[];
  errors: string[];
}

export interface ImageTestResult {
  url: string;
  success: boolean;
  images: {
    total: number;
    loaded: number;
    failed: number;
    broken: number;
  };
  imageDetails: ImageDetail[];
  errors: string[];
}

export interface ImageDetail {
  src: string;
  alt: string;
  width: number;
  height: number;
  status: 'loaded' | 'failed' | 'broken';
  error?: string;
}

export interface ErrorTestResult {
  url: string;
  success: boolean;
  consoleErrors: ConsoleError[];
  networkErrors: NetworkError[];
  resourceErrors: ResourceError[];
  totalErrors: number;
}

export interface ConsoleError {
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  lineNumber?: number;
  columnNumber?: number;
  stack?: string;
}

export interface NetworkError {
  url: string;
  status: number;
  statusText: string;
  method: string;
  resourceType: string;
}

export interface ResourceError {
  url: string;
  type: 'css' | 'js' | 'image' | 'font' | 'other';
  error: string;
}

export interface TestReport {
  timestamp: string;
  baseUrl: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  productPageResults: ProductPageTestResult[];
  imageResults: ImageTestResult[];
  errorResults: ErrorTestResult[];
  summary: {
    criticalIssues: number;
    warnings: number;
    recommendations: string[];
  };
}

export interface TestRunnerOptions {
  config: TestConfig;
  outputDir?: string;
  generateReport?: boolean;
  verbose?: boolean;
}

export type TestType = 'product-page' | 'image-loading' | 'error-detection' | 'all'; 