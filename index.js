const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const sourceMap = require('source-map');
const puppeteer = require('puppeteer');
const { URL } = require('url');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

async function downloadSourceMaps(websiteUrl, shouldRecord) {
  try {
    const baseUrl = new URL(websiteUrl);
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let recorder;
    if (shouldRecord) {
      const Config = {
        followNewTab: true,
        fps: 25,
        ffmpeg_Path:  null,
        videoFrame: {
          width: 1190,
          height: 1080,
        },
       // aspectRatio: '4:3',
      };

      // Initialize screen recorder
      recorder = new PuppeteerScreenRecorder(page, Config);
      await recorder.start(`screenRecordings/screen-recording-${baseUrl.hostname}.mp4`);
      console.log('Screen recording started.');
    }

    // Collect all script URLs, including lazy-loaded ones
    const scriptUrls = new Set();
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'];
      if (contentType && contentType.includes('application/javascript')) {
        scriptUrls.add(url);
      }
    });
    const timeout =30000
    // Navigate to the page with a more flexible approach
    try {
      await page.goto(websiteUrl, { timeout: timeout });

      // Wait for the page to be considered loaded
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'load', timeout: timeout }),
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: timeout }),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: timeout }),
        new Promise(resolve => setTimeout(resolve, timeout))
      ]);
    } catch (error) {
      console.warn(`Navigation encountered an issue: ${error.message}. Proceeding with content extraction.`);
    }

    // Wait a bit more to capture any delayed lazy-loaded scripts
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Process all collected script URLs
    for (const scriptUrl of scriptUrls) {
      await processJavaScriptFile(scriptUrl, baseUrl);
    }

    if (shouldRecord) {
      // Stop recording at the end of the Puppeteer session
      await recorder.stop();
      console.log('Screen recording stopped.');
    }

    await browser.close();
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
  let websiteUrl;
  let shouldRecord = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && i + 1 < args.length) {
      websiteUrl = args[i + 1];
      i++;
    } else if (args[i] === '--record') {
      shouldRecord = true;
    }
  }

  if (!websiteUrl) {
    console.log('Usage: node index.js --url <domain> [--record]');
    process.exit(1);
  }

  if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
    console.log('Please provide a full URL including the protocol (http:// or https://)');
    process.exit(1);
  }

  downloadSourceMaps(websiteUrl, shouldRecord);
}

main();