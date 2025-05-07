const puppeteer = require('puppeteer');
const fs = require('fs');

exports.generatePDF = async ({ title, author, htmlContent }) => {
  let browser;
  try {
    // 1. Launch browser with debug logs
    console.log('[1/6] Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--log-level=3' // Suppress unnecessary logs
      ],
      dumpio: true // Enable Puppeteer logs
    });

    const page = await browser.newPage();
    console.log('[2/6] Browser launched');

    // 2. Configure network monitoring
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      console.log(`[NETWORK] Loading: ${request.url()}`);
      request.continue();
    });

    // 3. Add error handlers
    page.on('pageerror', (error) => {
      console.error(`[PAGE ERROR] ${error}`);
    });

    page.on('console', (msg) => {
      console.log(`[BROWSER LOG] ${msg.text()}`);
    });

    // 4. Verify HTML content
    console.log('[3/6] Received HTML length:', htmlContent.length);
    fs.writeFileSync('debug-content.html', htmlContent);

    // 5. Set content with timeout
    console.log('[4/6] Loading content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // 6. Generate PDF
    console.log('[5/6] Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      printBackground: true,
      preferCSSPageSize: true
    });

    // 7. Validate PDF
    console.log('[6/6] Validating PDF...');
    if (!pdfBuffer || pdfBuffer.length < 100) {
      throw new Error('Invalid PDF buffer');
    }
    
    fs.writeFileSync('debug-output.pdf', pdfBuffer);
    return pdfBuffer;

  } catch (error) {
    console.error('[PDF GENERATION FAILED]', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('[CLEANUP] Browser closed');
    }
  }
};