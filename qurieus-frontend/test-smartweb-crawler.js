// Test script for debugging smartweb.in crawling
const puppeteer = require('puppeteer');

async function testSmartwebCrawling() {
    console.log('Testing smartweb.in crawling...');

    const browser = await puppeteer.launch({
        headless: true,
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
        ]
    });

    try {
        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Set timeouts
        await page.setDefaultNavigationTimeout(30000);
        await page.setDefaultTimeout(30000);

        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log('Navigating to https://www.smartweb.in/...');

        // Navigate to the page
        await page.goto('https://www.smartweb.in/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log('Navigation completed');

        // Wait for content
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for content selectors
        const selectors = ['main', 'article', '.content', '#content', '.main', '#main', 'body'];
        for (const selector of selectors) {
            const element = await page.$(selector);
            if (element) {
                console.log(`Found selector: ${selector}`);
                const text = await page.$eval(selector, el => el.textContent);
                console.log(`Text length: ${text.length}`);
                console.log(`First 200 chars: ${text.substring(0, 200)}`);
            }
        }

        // Get full HTML
        const html = await page.content();
        console.log(`Total HTML length: ${html.length}`);

        // Get page title
        const title = await page.title();
        console.log(`Page title: ${title}`);

        // Check if page has any text content
        const bodyText = await page.$eval('body', el => el.textContent);
        console.log(`Body text length: ${bodyText.length}`);
        console.log(`Body text preview: ${bodyText.substring(0, 300)}`);

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testSmartwebCrawling().catch(console.error); 