

# Source Map Downloader

An intelligent Node.js tool that extracts source maps from modern web applications (React, Vue, Angular, etc.). Unlike simple network sniffers, this tool **parses JavaScript bundles to discover ALL chunks**, including lazy-loaded ones that may never be triggered during a normal browsing session.

## Features

- **Intelligent Chunk Discovery**: Parses main/runtime JS files to find ALL chunk references
- **Comprehensive Coverage**: Finds lazy-loaded chunks that traditional network monitoring misses
- **Multi-Framework Support**: Works with Webpack, Vite, Rollup, and other bundlers
- **React-Optimized**: Especially effective at extracting React app source maps
- **Network Monitoring**: Also captures JS files loaded via network requests
- **Source Reconstruction**: Extracts original source files from source maps
- **Optional Screen Recording**: Record browser session for debugging
- **Interactive Extraction**: Includes `min.js` to process individual source maps via an interactive terminal prompt
- **Organized Output**: Saves source maps, original sources, and compiled JS separately

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js (version 18 or later recommended)
- You have a basic understanding of JavaScript and Node.js

## Installing Source Map Downloader

To install the Source Map Downloader, follow these steps:

1. Clone the repository or download the script.
2. Navigate to the project directory.
3. Install the required dependencies:

```bash
yarn install
# or
npm install
```

## Using Source Map Downloader

To use the Source Map Downloader, follow these steps:

1. Open a terminal/command prompt.
2. Navigate to the directory containing the script.
3. Run the script with the following command:

```
node index.js --url https://example.com [--record]
```

Replace `https://example.com` with the URL of the website you want to download source maps from.

### Command-line Options

- `--url <website-url>`: (Required) Specify the website URL to process.
- `--record`: (Optional) Enable screen recording of the browser session.

### Examples

```bash
# Basic usage - extract source maps from a React app
node index.js --url https://react-app.example.com

# With screen recording
node index.js --url https://app.example.com --record

# Extract from a production site
node index.js --url https://dashboard.company.com
```

## How it works

1. **Browser Launch**: Opens the target URL using Puppeteer with a realistic user agent.
2. **Network Monitoring**: Captures all JS files loaded via network requests.
3. **Main File Discovery**: Identifies main/runtime JS files that contain chunk manifests (prioritizing files with keywords like 'runtime', 'main', 'vendor').
4. **Chunk Parsing**: Analyzes main JS files using regex patterns to extract ALL chunk references:
   - Webpack chunk loading patterns
   - Dynamic import() statements
   - Chunk manifests and mappings
   - Static script references
5. **Comprehensive Collection**: Combines discovered chunks with network-captured files.
6. **Source Map Extraction**: For each JS file:
   - Downloads the file
   - Finds source map reference (`//# sourceMappingURL=...`)
   - Downloads the source map
   - Extracts all original source files
7. **Organized Storage**: Saves everything in structured directories:
   - `output/{hostname}/sourcemaps/` - Source map files
   - `output/{hostname}/sources/` - Original source code
   - `output/{hostname}/compiled/` - Compiled/bundled JS files
8. **Optional Recording**: If `--record` is enabled, saves browser session video.

## Directory Structure

```
output/
└── {hostname}/
    ├── sourcemaps/     # Source map JSON files
    │   ├── main.js.map
    │   └── chunk-123.js.map
    ├── sources/        # Original source code (reconstructed)
    │   ├── src/
    │   │   ├── App.jsx
    │   │   └── components/
    │   └── node_modules/
    └── compiled/       # Compiled/bundled JavaScript
        ├── main.js
        └── chunk-123.js

screenRecordings/       # Browser session videos (if --record used)
└── screen-recording-{hostname}-{timestamp}.mp4
```

## Notes

- **Chunk Discovery**: This tool is especially powerful for React apps and other single-page applications that use code splitting. It will find chunks that may never load during normal browsing.
- **Source Maps Required**: The tool can only extract source code if source maps are publicly accessible. Many production sites remove source maps.
- **Multiple Bundlers**: Works with Webpack, Vite, Rollup, Parcel, and other modern bundlers.
- **Output Organization**: Files are organized by hostname in the `output/` directory.
- **Network + Parsing**: Combines network monitoring with intelligent JS parsing for comprehensive coverage.

## Troubleshooting

If you encounter any issues:

1. **No source maps found**: Many production websites remove source maps. Try development/staging environments.
2. **Timeout errors**: Increase the timeout value in the code or try a faster network connection.
3. **Missing chunks**: Some apps may use non-standard chunk naming. The regex patterns can be extended.
4. **Screen recording issues**: Ensure ffmpeg is installed if using the `--record` option.
5. **403/401 errors**: Some sites require authentication or block automated requests.

### Common Issues

**Q: The tool only finds a few chunks, but I know there are more**  
A: Check if the site uses a custom bundler or non-standard chunk naming. You may need to add custom regex patterns to `extractChunkReferences()`.

**Q: Source maps download but extraction fails**  
A: Some source maps may be malformed or use unsupported formats. Check the console output for specific errors.

**Q: Getting 404 errors for chunk files**  
A: The chunk URLs might be relative and need different base URL resolution. Check the console to see which URLs are failing.

## Contributing to Source Map Downloader

To contribute to Source Map Downloader, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## License

This project uses the following license: [MIT License](<link_to_license>).

## Contact

If you want to contact me, you can reach me at <yunatamos@example.com>.

## Disclaimer

This tool is for educational purposes only. Always respect website terms of service and robots.txt files. Ensure you have permission before downloading source maps from any website.
