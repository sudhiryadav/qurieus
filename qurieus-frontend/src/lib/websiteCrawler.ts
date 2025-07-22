// Enhanced website crawler using Node.js libraries
// Uses Cheerio for HTML parsing, Puppeteer for JavaScript-heavy sites, and JSDOM for DOM manipulation

import * as cheerio from 'cheerio';
import puppeteer, { Browser } from 'puppeteer';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { crawlJobManager } from './crawlJobs';

interface CrawlSettings {
  maxDepth: number;
  maxPages: number;
  includeImages: boolean;
  includeLinks: boolean;
  respectRobotsTxt: boolean;
  delay: number;
  usePuppeteer: boolean; // For JavaScript-heavy sites
  extractMainContent: boolean; // Use advanced content extraction
}

interface CrawlResult {
  url: string;
  title: string;
  text: string;
  html: string;
  markdown: string;
  links: string[];
  metadata: Record<string, string>;
  images: string[];
  wordCount: number;
  readingTime: number;
}

export class WebsiteCrawler {
  private visitedUrls = new Set<string>();
  private results: CrawlResult[] = [];
  private settings: CrawlSettings;
  private jobId: string;
  private shouldStop = false;
  private browser: Browser | null = null;
  private turndownService: TurndownService;

  constructor(settings: CrawlSettings, jobId: string) {
    this.settings = settings;
    this.jobId = jobId;
    
    // Initialize Turndown for HTML to Markdown conversion
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      bulletListMarker: '-',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full'
    });
  }

  private async addLog(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', url?: string): Promise<void> {
    // Ensure message is always a string
    const messageStr = typeof message === 'string' ? message : String(message);
    await crawlJobManager.addLog(this.jobId, messageStr, type);
  }

  private async initializeBrowser(): Promise<void> {
    if (this.settings.usePuppeteer && !this.browser) {
      await this.addLog('Initializing Puppeteer browser...', 'info');
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
          timeout: 30000 // 30 second timeout for browser launch
        });
        await this.addLog('Puppeteer browser initialized successfully', 'success');
      } catch (error) {
        await this.addLog(`Failed to initialize Puppeteer browser: ${error}`, 'error');
        await this.addLog('Will use fetch-only mode', 'warning');
        this.settings.usePuppeteer = false;
      }
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.addLog('Closing Puppeteer browser...', 'info');
      await this.browser.close();
      this.browser = null;
      await this.addLog('Puppeteer browser closed', 'success');
    }
  }

  private cleanText(text: string): string {
    if (!text) return "";
    
    // Remove extra whitespace and normalize
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove excessive line breaks
    text = text.replace(/\n{3,}/g, '\n\n');
    
    return text;
  }

  private extractMainContentAdvanced(html: string, url: string): string {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .sidebar, .navigation, .menu, .ad, .advertisement, .banner, .popup, .modal, .overlay').remove();
    
    // Common content selectors (in order of preference)
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '#main',
      '.main',
      'body'
    ];
    
    let content = '';
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        if (content.length > 100) { // Minimum content threshold
          break;
        }
      }
    }
    // Fallback: if no content found, use body text
    if (!content || content.length < 100) {
      content = $('body').text();
    }
    return this.cleanText(content);
  }

  private extractMetadata($: cheerio.CheerioAPI): Record<string, string> {
    const metadata: Record<string, string> = {};
    
    // Basic meta tags
    $('meta').each((_: number, element: any) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');
      if (name && content) {
        metadata[name] = content;
      }
    });
    
    // Open Graph tags
    $('meta[property^="og:"]').each((_: number, element: any) => {
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      if (property && content) {
        metadata[property] = content;
      }
    });
    
    // Twitter Card tags
    $('meta[name^="twitter:"]').each((_: number, element: any) => {
      const name = $(element).attr('name');
      const content = $(element).attr('content');
      if (name && content) {
        metadata[name] = content;
      }
    });
    
    return metadata;
  }

  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_: number, element: any) => {
      const href = $(element).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          // Only include same-domain links
          if (new URL(absoluteUrl).hostname === new URL(baseUrl).hostname) {
            links.push(absoluteUrl);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });
    
    return Array.from(new Set(links)); // Remove duplicates
  }

  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    
    $('img[src]').each((_: number, element: any) => {
      const src = $(element).attr('src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          images.push(absoluteUrl);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });
    
    return Array.from(new Set(images)); // Remove duplicates
  }

  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private async crawlPageWithPuppeteer(url: string): Promise<CrawlResult | null> {
    if (!this.browser) return null;
    
    let page = null;
    try {
      await this.addLog(`Crawling with Puppeteer: ${url}`, 'info', url);
      
      // Create page with timeout
      page = await this.browser.newPage();
      await this.addLog(`Created Puppeteer page for ${url}`, 'info', url);
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await this.addLog(`Set user agent for ${url}`, 'info', url);
      
      // Set timeout
      await page.setDefaultNavigationTimeout(10000); // Reduced to 10 seconds
      await page.setDefaultTimeout(10000);
      await this.addLog(`Set timeouts for ${url}`, 'info', url);
      
      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      await this.addLog(`Set request interception for ${url}`, 'info', url);
      
      // Navigate to page with shorter timeout and more aggressive options
      await this.addLog(`Navigating to ${url}...`, 'info', url);
      
      // Add timeout wrapper around navigation
      const navigationPromise = page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 20000 
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Navigation timeout')), 20000);
      });
      
      await Promise.race([navigationPromise, timeoutPromise]);
      await this.addLog(`Navigation completed for ${url}`, 'success', url);
      
      // Wait for main content selector (non-fatal)
      try {
        await page.waitForSelector('main', { timeout: 10000 });
        await this.addLog(`'main' selector found for ${url}`, 'info', url);
      } catch (e) {
        await this.addLog(`'main' selector not found for ${url}, continuing`, 'warning', url);
      }
      
      // Wait for content to load (reduced wait time)
      await this.addLog(`Waiting for content to load...`, 'info', url);
      await new Promise(resolve => setTimeout(resolve, 500)); // Reduced to 500ms
      
      // Get the HTML content
      await this.addLog(`Extracting HTML content from ${url}...`, 'info', url);
      const html = await page.content();
      await this.addLog(`HTML content extracted (${html.length} characters)`, 'success', url);
      
      // Close the page
      await page.close();
      page = null;
      await this.addLog(`Page closed for ${url}`, 'info', url);
      
      await this.addLog(`Successfully crawled with Puppeteer: ${url}`, 'success', url);
      return this.parseHtmlContent(html, url);
    } catch (error) {
      await this.addLog(`Error crawling with Puppeteer ${url}: ${error}`, 'error', url);
      
      // Clean up page if it exists
      if (page) {
        try {
          await page.close();
          await this.addLog(`Cleaned up page after error for ${url}`, 'info', url);
        } catch (closeError) {
          await this.addLog(`Error closing page after crawl error: ${closeError}`, 'warning', url);
        }
      }
      
      return null;
    }
  }

  private async crawlPageWithFetch(url: string): Promise<CrawlResult | null> {
    try {
      await this.addLog(`Crawling with fetch: ${url}`, 'info', url);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        await this.addLog(`HTTP ${response.status} error for ${url}`, 'error', url);
        return null;
      }

      const html = await response.text();
      await this.addLog(`Successfully crawled with fetch: ${url}`, 'success', url);
      return this.parseHtmlContent(html, url);
    } catch (error) {
      await this.addLog(`Error crawling with fetch ${url}: ${error}`, 'error', url);
      return null;
    }
  }

  private parseHtmlContent(html: string, url: string): CrawlResult {
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim();
    
    // Extract main content
    const text = this.settings.extractMainContent 
      ? this.extractMainContentAdvanced(html, url)
      : $('body').text();
    
    // Convert HTML to Markdown
    const markdown = this.turndownService.turndown(html);
    
    // Extract metadata
    const metadata = this.extractMetadata($);
    
    // Extract links
    const links = this.extractLinks($, url);
    
    // Extract images
    const images = this.settings.includeImages ? this.extractImages($, url) : [];
    
    // Calculate statistics
    const wordCount = text.split(/\s+/).length;
    const readingTime = this.calculateReadingTime(text);
    
    return {
      url,
      title: this.cleanText(title),
      text: this.cleanText(text),
      html,
      markdown,
      links,
      metadata,
      images,
      wordCount,
      readingTime
    };
  }

  private async crawlPage(url: string): Promise<CrawlResult | null> {
    // Add timeout wrapper to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 15000); // Reduced to 15 seconds
    });

    const crawlPromise = (async () => {
      // Try Puppeteer first if enabled
      if (this.settings.usePuppeteer) {
        await this.addLog(`Attempting Puppeteer crawl for ${url}`, 'info', url);
        const result = await this.crawlPageWithPuppeteer(url);
        if (result) {
          await this.addLog(`Puppeteer crawl successful for ${url}`, 'success', url);
          return result;
        } else {
          await this.addLog(`Puppeteer crawl failed for ${url}, disabling Puppeteer for remaining pages`, 'warning', url);
          this.settings.usePuppeteer = false; // Disable Puppeteer for all future pages
        }
      }
      
      // Fallback to fetch
      await this.addLog(`Using fetch fallback for ${url}`, 'info', url);
      return await this.crawlPageWithFetch(url);
    })();

    try {
      const result = await Promise.race([crawlPromise, timeoutPromise]);
      if (result === null) {
        await this.addLog(`Crawl timeout for ${url}`, 'error', url);
      }
      return result;
    } catch (error) {
      await this.addLog(`Crawl error for ${url}: ${error}`, 'error', url);
      return null;
    }
  }

  private async delay(ms: number): Promise<void> {
    if (ms > 0) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  public async crawl(baseUrl: string): Promise<CrawlResult[]> {
    this.visitedUrls.clear();
    this.results = [];
    this.shouldStop = false;

    await this.addLog(`Starting crawl for: ${baseUrl}`, 'info');
    await this.addLog(`Settings: Max depth=${this.settings.maxDepth}, Max pages=${this.settings.maxPages}, Delay=${this.settings.delay}ms`, 'info');

    try {
      await this.initializeBrowser();
      await this.crawlRecursive(baseUrl, 0);
      
      await this.addLog(`Crawling completed. Extracted ${this.results.length} pages from ${this.visitedUrls.size} visited URLs`, 'success');
    } catch (error) {
      await this.addLog(`Crawling failed: ${error}`, 'error');
      throw error;
    } finally {
      await this.closeBrowser();
    }
    
    return this.results;
  }

  private async crawlRecursive(url: string, depth: number): Promise<void> {
    if (this.shouldStop || depth > this.settings.maxDepth || this.visitedUrls.size >= this.settings.maxPages) {
      if (this.shouldStop) {
        await this.addLog('Crawling stopped by user', 'warning');
      } else if (depth > this.settings.maxDepth) {
        await this.addLog(`Reached maximum depth (${this.settings.maxDepth})`, 'info');
      } else if (this.visitedUrls.size >= this.settings.maxPages) {
        await this.addLog(`Reached maximum pages limit (${this.settings.maxPages})`, 'info');
      }
      return;
    }

    if (this.visitedUrls.has(url)) {
      return;
    }

    this.visitedUrls.add(url);
    await this.addLog(`Crawling: ${url} (depth: ${depth}, visited: ${this.visitedUrls.size})`, 'info', url);

    // Update job progress
    await crawlJobManager.updateJob(this.jobId, {
      crawledPages: this.visitedUrls.size,
      totalPages: this.settings.maxPages
    });

    const result = await this.crawlPage(url);
    if (result && result.text.trim()) {
      this.results.push(result);
      await this.addLog(`Extracted content from ${url} (${result.wordCount} words, ${result.readingTime} min read)`, 'success', url);
    } else {
      await this.addLog(`No content extracted from ${url}`, 'warning', url);
    }

    // Respect delay
    if (this.settings.delay > 0) {
      await this.addLog(`Waiting ${this.settings.delay}ms before next request...`, 'info');
      await this.delay(this.settings.delay);
    }

    // Crawl links if we haven't reached the limit
    if (depth < this.settings.maxDepth && result && this.visitedUrls.size < this.settings.maxPages) {
      const newUrls = result.links.filter(link => !this.visitedUrls.has(link));
      await this.addLog(`Found ${newUrls.length} new links to crawl from ${url}`, 'info', url);
      
      for (const link of newUrls) {
        if (this.visitedUrls.size >= this.settings.maxPages || this.shouldStop) {
          break;
        }
        await this.crawlRecursive(link, depth + 1);
      }
    }
  }

  public async stop(): Promise<void> {
    this.shouldStop = true;
    await this.addLog('Stop signal received', 'warning');
  }

  public getProgress(): { visited: number; total: number } {
    return {
      visited: this.visitedUrls.size,
      total: this.settings.maxPages
    };
  }
} 