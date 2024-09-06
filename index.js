const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const sourceMap = require('source-map');
const puppeteer = require('puppeteer');
const { URL } = require('url');

async function downloadSourceMaps(websiteUrl) {
  try {
    const baseUrl = new URL(websiteUrl);
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Collect all script URLs, including lazy-loaded ones
    const scriptUrls = new Set();
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'];
      if (contentType && contentType.includes('application/javascript')) {
        scriptUrls.add(url);
      }
    });
    await page.goto(websiteUrl, { waitUntil: 'networkidle0' });
    // Wait a bit more to capture any delayed lazy-loaded scripts
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
    // Process all collected script URLs
    for (const scriptUrl of scriptUrls) {
      await processJavaScriptFile(scriptUrl, baseUrl);
    }
    console.log('All source maps downloaded and extracted successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function processJavaScriptFile(jsUrl, baseUrl) {
  try {
    console.log(`Processing: ${jsUrl}`);
    const response = await axios.get(jsUrl);
    const jsContent = response.data;
    const sourceMapUrlMatch = jsContent.match(/\/\/# sourceMappingURL=(.+)/);
    if (!sourceMapUrlMatch) {
      console.warn(`No source map reference found for ${jsUrl}`);
      return;
    }
    const sourceMapUrl = new URL(sourceMapUrlMatch[1], jsUrl).toString();
    const sourceMapResponse = await axios.get(sourceMapUrl);
    const sourceMapData = sourceMapResponse.data;
    const consumer = await new sourceMap.SourceMapConsumer(sourceMapData);
    const sources = consumer.sources;
    for (const source of sources) {
      const content = consumer.sourceContentFor(source);
      if (content) {
        const sourceUrl = new URL(source, baseUrl);
        const filePath = path.join('sources', sourceUrl.hostname, sourceUrl.pathname);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }
    }
    // Save the compiled JS file as well
    const jsFilePath = path.join('sources', baseUrl.hostname, new URL(jsUrl).pathname);
    await fs.mkdir(path.dirname(jsFilePath), { recursive: true });
    await fs.writeFile(jsFilePath, jsContent);
    console.log(`Source map processed for ${jsUrl}`);
  } catch (error) {
    console.error(`Error processing ${jsUrl}:`, error.message);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--url') {
    console.log('Usage: node index.js --url <domain>');
    process.exit(1);
  }

  const websiteUrl = args[1];
  if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
    console.log('Please provide a full URL including the protocol (http:// or https://)');
    process.exit(1);
  }

  downloadSourceMaps(websiteUrl);
}

main();