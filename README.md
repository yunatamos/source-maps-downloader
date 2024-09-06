# Source Map Downloader

This Node.js script automates the process of downloading and extracting source maps from websites. It uses Puppeteer to navigate web pages, captures all JavaScript files (including lazy-loaded ones), and then processes their source maps to reconstruct the original source files.

## Features

- Automated navigation of web pages using Puppeteer
- Captures all JavaScript files, including those that are lazy-loaded
- Extracts and processes source maps
- Reconstructs original source files
- Saves both compiled JavaScript and original source files

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js (version 12 or later recommended)
- You have a basic understanding of JavaScript and Node.js

## Installing Source Map Downloader

To install the Source Map Downloader, follow these steps:

1. Clone the repository or download the script.
2. Navigate to the project directory.
3. Install the required dependencies:

```
npm install axios puppeteer source-map
```

## Using Source Map Downloader

To use the Source Map Downloader, follow these steps:

1. Open a terminal/command prompt.
2. Navigate to the directory containing the script.
3. Run the script with the following command:

```
node index.js --url https://example.com
```

Replace `https://example.com` with the URL of the website you want to download source maps from.

## How it works

1. The script uses Puppeteer to open the specified URL in a headless browser.
2. It captures all JavaScript files loaded by the page, including lazy-loaded scripts.
3. For each JavaScript file, it looks for a source map URL.
4. If a source map is found, it's downloaded and processed.
5. The original source files are reconstructed from the source map.
6. Both the compiled JavaScript and the original source files are saved to the `sources` directory.

## Notes

- The script creates a `sources` directory in the same location as the script. This is where all downloaded files will be saved.
- The directory structure within `sources` will mirror the structure of the URLs from which the files were downloaded.
- If a website doesn't use source maps or if they're not accessible, the script will only save the compiled JavaScript files.

## Troubleshooting

If you encounter any issues:

1. Ensure you have the latest versions of the required dependencies.
2. Check that the website you're targeting allows scraping and doesn't have measures in place to prevent it.
3. Some websites might not use source maps or might have them protected. In these cases, you'll only get the compiled JavaScript files.

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
